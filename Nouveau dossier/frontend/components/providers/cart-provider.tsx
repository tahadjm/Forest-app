"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import CartService from "@/services/cart-service"
import { useAuth } from "@/context/auth-context"
import type { CartItem } from "@/types/cart"

interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  isLoading: boolean
  subtotal: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [serverAvailable, setServerAvailable] = useState(false)
  const [lastSyncAttempt, setLastSyncAttempt] = useState(0)
  const { isAuthenticated } = useAuth()

  // Calculate subtotal
  const subtotal = items.reduce((total, item) => {
    return total + item.totalPrice
  }, 0)

  // Load cart from server or localStorage
  useEffect(() => {
    const loadCart = async () => {
      setIsLoading(true)

      try {
        // Only try to load from server if authenticated and we haven't tried recently
        if (isAuthenticated && Date.now() - lastSyncAttempt > 30000) {
          setLastSyncAttempt(Date.now())

          const response = await CartService.getCart()

          if (response) {
            // Handle the response format from the backend
            if (response.bookings && Array.isArray(response.bookings)) {
              setItems(response.bookings)
            } else if (response.items && Array.isArray(response.items)) {
              setItems(response.items)
            } else {
              // If no items found, set empty array
              setItems([])
            }

            setServerAvailable(true)

            // Save to localStorage as backup
            localStorage.setItem("cart", JSON.stringify(items))
          }
        } else if (!isAuthenticated) {
          // Load from localStorage if not authenticated
          const savedCart = localStorage.getItem("cart")
          if (savedCart) {
            setItems(JSON.parse(savedCart))
          }
        }
      } catch (err) {
        console.error("Failed to load cart from server, falling back to local storage:", err)

        // Load from localStorage as fallback
        const savedCart = localStorage.getItem("cart")
        if (savedCart) {
          setItems(JSON.parse(savedCart))
        }

        setServerAvailable(false)
      } finally {
        setIsLoading(false)
      }
    }

    loadCart()
  }, [isAuthenticated, lastSyncAttempt])

  // Sync cart to server when items change
  useEffect(() => {
    const syncCart = async () => {
      // Skip if not authenticated or server is known to be unavailable
      if (!isAuthenticated || !serverAvailable) {
        localStorage.setItem("cart", JSON.stringify(items))
        return
      }

      try {
        await CartService.syncCart(items)
      } catch (err) {
        console.warn("Failed to sync cart to server, changes saved locally only:", err)
        setServerAvailable(false)
      }

      // Always save to localStorage as backup
      localStorage.setItem("cart", JSON.stringify(items))
    }

    // Only sync if we have items and we're not in the initial loading state
    if (!isLoading && items.length > 0) {
      syncCart()
    } else if (!isLoading) {
      // If cart is empty, just save to localStorage
      localStorage.setItem("cart", JSON.stringify(items))
    }
  }, [items, isAuthenticated, serverAvailable, isLoading])

  // Add item to cart
  const addItem = useCallback(
    async (item: CartItem) => {
      setItems((prevItems) => {
        const existingItem = prevItems.find((i) => i._id === item._id)

        if (existingItem) {
          // Update quantity if item already exists
          return prevItems.map((i) => (i._id === item._id ? { ...i, quantity: i.quantity + item.quantity } : i))
        } else {
          // Add new item
          return [...prevItems, item]
        }
      })

      // If authenticated and server is available, try to add item to server cart
      if (isAuthenticated && serverAvailable) {
        try {
          // Extract the necessary fields for the backend
          const { pricingId, slotId, quantity, price } = item

          if (pricingId && slotId && quantity && price) {
            const response = await CartService.addToCart(pricingId, slotId, quantity, price)

            // Update local cart with server response if available
            if (response && response.bookings) {
              setItems(response.bookings)
            }
          }
        } catch (err) {
          console.warn("Failed to add item to server cart, item added locally only:", err)
        }
      }
    },
    [isAuthenticated, serverAvailable],
  )

  // Remove item from cart
  const removeItem = useCallback(
    async (id: string) => {
      setItems((prevItems) => prevItems.filter((item) => item._id !== id))

      // If authenticated and server is available, try to remove item from server cart
      if (isAuthenticated && serverAvailable) {
        try {
          await CartService.removeCartItems([id])
        } catch (err) {
          console.warn("Failed to remove item from server cart, item removed locally only:", err)
        }
      }
    },
    [isAuthenticated, serverAvailable],
  )

  // Update item quantity
  const updateQuantity = useCallback(
    async (id: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(id)
        return
      }

      setItems((prevItems) =>
        prevItems.map((item) =>
          item._id === id
            ? {
                ...item,
                quantity,
                // Recalculate totalPrice based on unit price
                totalPrice: (item.totalPrice / item.quantity) * quantity,
              }
            : item,
        ),
      )

      // If authenticated and server is available, try to update item quantity on server
      if (isAuthenticated && serverAvailable) {
        try {
          const response = await CartService.updateCartItem(id, quantity)

          // Update local cart with server response if available
          if (response && response.bookings) {
            setItems(response.bookings)
          }
        } catch (err) {
          console.warn("Failed to update item quantity on server, updated locally only:", err)
        }
      }
    },
    [removeItem, isAuthenticated, serverAvailable],
  )

  // Clear cart
  const clearCart = useCallback(async () => {
    setItems([])
    localStorage.removeItem("cart")

    // If authenticated and server is available, sync empty cart to server
    if (isAuthenticated && serverAvailable) {
      try {
        await CartService.clearCart()
      } catch (err) {
        console.warn("Failed to clear cart on server:", err)
      }
    }
  }, [isAuthenticated, serverAvailable])

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isLoading,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
