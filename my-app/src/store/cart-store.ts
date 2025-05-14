import { create } from "zustand"
import CartService from "@/services/cart-service"

interface CartItem {
  id: string
  name: string
  price: number
  date: string | Date
  time: string
  quantity: number
  pricingId: string
  parkId: string
  timeSlotId?: string
  image?: string
  description?: string
}

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  totalItems: number
  totalPrice: number
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  setIsOpen: (open: boolean) => void
}

// Create a separate store for UI state that doesn't need to be persisted
const useCartUIStore = create<Pick<CartStore, "isOpen" | "setIsOpen">>((set) => ({
  isOpen: false,
  setIsOpen: (open) => {
    console.log("Setting cart open state to:", open)
    set({ isOpen: open })
  },
}))

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,
  totalItems: 0,
  totalPrice: 0,
  addItem: async (item) => {
    set({ isLoading: true, error: null })
    try {
      // Add item to cart in the API
      //await apiClient.post("/cart/add", item)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Update local state
      set((state) => {
        const updatedItems = [...state.items, item]
        return {
          items: updatedItems,
          totalItems: updatedItems.length,
          totalPrice: 0, //calculateTotalPrice(updatedItems),
          isLoading: false,
        }
      })

      // Refresh the router to update UI
      // We can't directly use useRouter here since this is outside a React component
      // Instead, we'll dispatch a custom event that components can listen for
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("cart-updated"))
      }

      return true
    } catch (error) {
      console.error("Error adding item to cart:", error)
      set({ error: "Failed to add item to cart", isLoading: false })
      return false
    }
  },
  removeItem: (id) => {
    const { items } = get()
    const itemToRemove = items.find((i) => i.id === id)

    if (itemToRemove) {
      set({
        items: items.filter((i) => i.id !== id),
        totalItems: get().totalItems - itemToRemove.quantity,
        totalPrice: get().totalPrice - itemToRemove.price * itemToRemove.quantity,
      })

      // Try to remove from server cart
      CartService.removeCartItems([id]).catch((err) => console.warn("Failed to remove item from server cart:", err))
    }
  },
  updateQuantity: (id, quantity) => {
    const { items } = get()
    const itemToUpdate = items.find((i) => i.id === id)

    if (itemToUpdate) {
      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        get().removeItem(id)
        return
      }

      const quantityDiff = quantity - itemToUpdate.quantity
      set({
        items: items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        totalItems: get().totalItems + quantityDiff,
        totalPrice: get().totalPrice + itemToUpdate.price * quantityDiff,
      })

      // Try to update on server
      CartService.updateCartItem(id, quantity).catch((err) =>
        console.warn("Failed to update item quantity on server:", err),
      )
    }
  },
  clearCart: () => {
    set({
      items: [],
      totalItems: 0,
      totalPrice: 0,
    })

    // Try to clear server cart
    CartService.clearCart().catch((err) => console.warn("Failed to clear server cart:", err))
  },
  setIsOpen: (open) => {
    console.log("Setting cart open state to:", open)
    // Update both the persisted store and the UI store
    set({ isOpen: open })
    useCartUIStore.getState().setIsOpen(open)
  },
}))

// Export a hook that combines both stores
export const useCartUI = () => {
  const { isOpen } = useCartUIStore()
  const { setIsOpen } = useCartStore()

  return { isOpen, setIsOpen }
}

// Add this to the addToCart function
const addToCart = async (item: CartItem) => {
  const { setState, getState } = useCartStore.getState()
  const set = setState
  try {
    set({ isLoading: true })
    //const response = await cartService.addToCart(item);
    //set((state) => ({
    //  items: [...state.items, response],
    //  total: calculateTotal([...state.items, response]),
    //}));

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Update local state
    set((state: any) => {
      const updatedItems = [...state.items, item]
      return {
        items: updatedItems,
        totalItems: updatedItems.length,
        totalPrice: 0, //calculateTotalPrice(updatedItems),
        isLoading: false,
      }
    })

    // Dispatch a custom event to refresh the page
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("cart-updated"))
    }

    return item
  } catch (error) {
    console.error("Error adding to cart:", error)
    throw error
  } finally {
    set({ isLoading: false })
  }
}
