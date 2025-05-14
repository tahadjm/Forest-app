"use client"

import { useState, useEffect } from "react"
import { ShoppingCart, X, Trash2, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { toast } from "react-hot-toast"
import axios from "axios"
import { PaymentProcessor } from "./payment/payment-processor"
import { CartService } from "@/services/cart-service"
import { useAuth } from "@/context/auth-context"
import { useAuthModalStore } from "@/store/useModalStore"
import type { Cart, CartItem } from "@/types/cart"
import { useCartStore } from "@/store/cart-store"

interface CartPanelProps {
  onRemoveItem?: (id: string) => void
  items?: CartItem[] // Now using the proper type
}

const EMPTY_CART: Cart = {
  bookings: [],
  _id: "",
  user: "",
  status: "pending",
}

export function CartPanel({ onRemoveItem, items = [] }: CartPanelProps) {
  // Get isOpen and setIsOpen from the cart store
  const isOpen = useCartStore((state) => state.isOpen)
  const setIsOpen = useCartStore((state) => state.setIsOpen)

  const [cart, setCart] = useState<Cart>(EMPTY_CART)
  const [loading, setLoading] = useState(true)
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const { isAuthenticated } = useAuth()

  // Get the openModal function from your auth modal store
  const openModal = useAuthModalStore((state) => state.openModal)

  // Add debugging for isOpen state changes
  useEffect(() => {
    console.log("CartPanel: isOpen state changed to", isOpen)
  }, [isOpen])

  // Update the loadCart function to better handle cart updates
  const loadCart = async () => {
    if (!isAuthenticated) return

    try {
      setLoading(true)
      const userCart = await CartService.getCart()

      // Double-check that we only display pending carts
      if (!userCart || userCart.status !== "pending") {
        setCart(EMPTY_CART)
        return
      }

      setCart(userCart)
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        // Handle 404 as empty cart
        setCart(EMPTY_CART)
        return
      }

      console.error("Failed to load cart:", error)
      toast.error("Impossible de charger le panier")
      setCart(EMPTY_CART)
    } finally {
      setLoading(false)
    }
  }

  // Add a useEffect to reload cart when items change
  useEffect(() => {
    if (isAuthenticated && items && items.length > 0) {
      loadCart()
    }
  }, [isAuthenticated, items])

  // Check authentication and load cart if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadCart().then(() => {
        checkTimeSlotAvailability()
      })
    } else {
      // Reset cart when user is not authenticated
      setCart(EMPTY_CART)
    }
  }, [isAuthenticated])

  // Check if time slots are still available
  const checkTimeSlotAvailability = async () => {
    if (!cart || !cart.bookings || cart.bookings.length === 0 || cart.status !== "pending") return

    const itemsToRemove: string[] = []
    const currentDate = new Date()

    // Check each booking for availability
    for (const item of cart.bookings) {
      if (!item._id) continue

      try {
        // Check if timeSlotInstance is populated as an object
        const timeSlotInstance = typeof item.timeSlotInstance === "object" ? item.timeSlotInstance : null

        if (!timeSlotInstance) continue

        // Check if time slot date has passed
        if (timeSlotInstance.date) {
          const bookingDate = new Date(timeSlotInstance.date)
          const [hours, minutes] = timeSlotInstance.startTime?.split(":") || ["0", "0"]
          bookingDate.setHours(Number.parseInt(hours), Number.parseInt(minutes))

          if (bookingDate < currentDate) {
            itemsToRemove.push(item._id)
            toast.info(`Un créneau expiré a été retiré de votre panier`)
            continue
          }
        }

        // Check if time slot instance has enough available tickets
        if (timeSlotInstance.availableTickets < item.quantity) {
          if (timeSlotInstance.availableTickets <= 0) {
            itemsToRemove.push(item._id)
            toast.info(`Un créneau complet a été retiré de votre panier`)
          } else {
            // Update quantity to match available tickets
            await CartService.updateCartItem(item._id, timeSlotInstance.availableTickets)
            toast.info(`La quantité a été ajustée en fonction des places disponibles`)
          }
        }
      } catch (error) {
        // If there's an error, remove the item
        if (item._id) {
          itemsToRemove.push(item._id)
          toast.info(`Un créneau indisponible a été retiré de votre panier`)
        }
      }
    }

    // Remove unavailable items
    if (itemsToRemove.length > 0) {
      await CartService.removeCartItems(itemsToRemove)
      await loadCart() // Reload cart
    }
  }

  // Combine server cart items with local items if provided
  const cartItems = cart.status === "pending" ? [...(cart.bookings || []), ...items] : [...items]

  const itemCount = cartItems.length
  const totalAmount =
    cart.totalAmount ||
    cartItems.reduce((sum, item) => {
      return sum + item.totalPrice
    }, 0)

  const handleRemoveItem = async (itemId: string) => {
    try {
      await CartService.removeFromCart([itemId])
      onRemoveItem?.(itemId)
      setCart((prev) => ({
        ...prev,
        bookings: prev.bookings.filter((item) => item._id !== itemId),
      }))
      toast.success("Article supprimé du panier")
    } catch (error) {
      console.error("Failed to remove item:", error)
      toast.error("Échec de la suppression")
    }
  }

  const handleClearCart = async () => {
    try {
      await CartService.clearCart()
      setCart(EMPTY_CART)
      toast.success("Panier vidé")
    } catch (error) {
      console.error("Failed to clear cart:", error)
      toast.error("Échec du vidage du panier")
    }
  }

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    try {
      const validQuantity = Math.max(1, Math.min(quantity, 10))
      await CartService.updateCartItem(itemId, validQuantity)

      // Update local cart state
      setCart((prev) => ({
        ...prev,
        bookings: prev.bookings.map((item) => (item._id === itemId ? { ...item, quantity: validQuantity } : item)),
      }))

      // Reload cart to get updated total
      await loadCart()

      toast.success("Quantité mise à jour")
    } catch (error) {
      console.error("Failed to update quantity:", error)
      toast.error("Échec de la mise à jour")
    }
  }

  const handleCheckout = async () => {
    if (itemCount === 0) {
      toast.error("Votre panier est vide")
      return
    }

    // Check if user is authenticated
    if (!isAuthenticated) {
      toast.error("Veuillez vous connecter pour procéder au paiement")
      openModal() // Open the auth modal
      return
    }

    // Ensure we're working with a pending cart
    if (cart.status !== "pending") {
      toast.error("Impossible de procéder au paiement")
      return
    }

    setIsPaymentOpen(true)
  }

  const handlePaymentSuccess = async () => {
    try {
      // Update cart status to confirmed and payment status to paid
      await CartService.checkoutCart("paid", "card")
      toast.success("Paiement réussi !")

      // Reload cart (which will be empty since status is now "confirmed")
      await loadCart()

      // Notify any parent components about the cart update
      if (onRemoveItem) {
        // This will trigger a refresh in parent components
        onRemoveItem("all")
      }
    } catch (error) {
      console.error("Failed to process payment:", error)
      toast.error("Échec du paiement")
    }

    // Close panels
    setIsOpen(false)
    setIsPaymentOpen(false)
  }

  const toggleCart = () => {
    console.log("Toggling cart, current state:", isOpen)
    setIsOpen(!isOpen)
  }

  // Helper function to format date from TimeSlotInstance
  const formatSlotDate = (timeSlotInstance: any) => {
    if (!timeSlotInstance || typeof timeSlotInstance !== "object" || !timeSlotInstance.date) return ""

    try {
      return format(new Date(timeSlotInstance.date), "EEEE d MMMM yyyy", { locale: fr })
    } catch (error) {
      return ""
    }
  }

  // Helper function to format time from TimeSlotInstance
  const formatSlotTime = (timeSlotInstance: any) => {
    if (!timeSlotInstance || typeof timeSlotInstance !== "object") return ""
    return timeSlotInstance.startTime ? `${timeSlotInstance.startTime} - ${timeSlotInstance.endTime || ""}` : ""
  }

  // Don't render anything if user is not authenticated
  if (!isAuthenticated) {
    return null
  }

  console.log("Rendering cart panel, isOpen:", isOpen)

  return (
    <>
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!isOpen}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-semibold text-adventure-900">Votre Panier</h2>
            <Button variant="ghost" size="icon" onClick={toggleCart}>
              <X className="h-6 w-6" />
            </Button>
          </div>

          <div className="flex-1 overflow-auto p-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-adventure-600"></div>
              </div>
            ) : itemCount > 0 ? (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item._id || `local-${item.pricingName}`} className="bg-gray-50 rounded-lg p-3 relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 text-gray-500 hover:text-red-500"
                      onClick={() => item._id && handleRemoveItem(item._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>

                    <div className="pr-8">
                      <h3 className="font-medium text-adventure-900">{item.pricingName || "Article sans nom"}</h3>

                      {item.timeSlotInstance && typeof item.timeSlotInstance === "object" && (
                        <>
                          <p className="text-sm text-adventure-600">{formatSlotDate(item.timeSlotInstance)}</p>
                          <p className="text-sm text-adventure-600">Horaire: {formatSlotTime(item.timeSlotInstance)}</p>
                        </>
                      )}

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => item._id && handleUpdateQuantity(item._id, Math.max(1, item.quantity - 1))}
                            disabled={item.quantity <= 1}
                          >
                            -
                          </Button>
                          <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => item._id && handleUpdateQuantity(item._id, item.quantity + 1)}
                          >
                            +
                          </Button>
                        </div>
                        <span className="font-medium text-adventure-900">{item.totalPrice.toFixed(2)} DZD</span>
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-red-500 hover:text-red-700 mt-2 flex items-center justify-center"
                  onClick={handleClearCart}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Vider le panier
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Votre panier est vide</p>
                <p className="text-sm mt-1">Ajoutez des activités pour commencer</p>
              </div>
            )}
          </div>

          {itemCount > 0 && (
            <div className="p-4 border-t">
              <div className="flex justify-between mb-2">
                <span className="text-adventure-600">Total</span>
                <span className="font-semibold text-adventure-900">{totalAmount.toFixed(2)} DZD</span>
              </div>
              <Button
                className="w-full bg-adventure-500 hover:bg-adventure-600 text-white"
                onClick={handleCheckout}
                disabled={cart.status !== "pending"}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Procéder au paiement
              </Button>
            </div>
          )}
        </div>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleCart}
          role="presentation"
          aria-label="Fermer le panier"
        />
      )}

      <PaymentProcessor
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        onSuccess={handlePaymentSuccess}
        totalAmount={totalAmount}
      />
    </>
  )
}
