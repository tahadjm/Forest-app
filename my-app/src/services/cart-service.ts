import apiClient from "@/lib/api-client"
import type { CartItem as BaseCartItem } from "@/types/cart"

// Update the TimeSlot interface to TimeSlotInstance
export interface TimeSlot {
  _id: string
  templateId: string
  date: string
  startTime: string
  endTime: string
  availableTickets: number
  ticketLimit: number
  priceAdjustment: number
}

// Add the timeSlotInstance field to the CartItem interface
export interface CartItem extends Omit<BaseCartItem, "timeSlotInstanceId" | "timeSlotInstance"> {
  _id?: string
  park: string
  pricingId: string
  pricingName: string
  timeSlotInstanceId: string // New field
  timeSlotInstance?: TimeSlot // New field for populated data
  quantity: number
  unitPrice: number
  totalPrice?: number
  date: string
  startTime: string
  endTime: string
}

export const CartService = {
  // Get the current user's cart
  getCart: async () => {
    try {
      const response = await apiClient.get("/cart")
      return response.data
    } catch (error: any) {
      // Don't log 404 errors as they're expected when cart is empty
      if (error.response?.status !== 404) {
        console.error("Error fetching cart:", error)
      }

      // Return empty cart on error instead of throwing
      return {
        items: [],
        totalItems: 0,
        totalPrice: 0,
      }
    }
  },

  // Add an item to the cart
  addToCart: async (item: Partial<CartItem>) => {
    try {
      const response = await apiClient.post("/cart/add", item)
      return response.data
    } catch (error) {
      console.error("Error adding item to cart:", error)
      throw error
    }
  },

  // Update an item in the cart
  updateCartItem: async (itemId: string, quantity: number) => {
    try {
      const response = await apiClient.put(`/cart/items/${itemId}`, { quantity })
      return response.data
    } catch (error) {
      console.error("Error updating cart item:", error)
      throw error
    }
  },

  // Remove an item from the cart
  removeFromCart: async (itemIds: string[]) => {
    try {
      console.log(itemIds)
      const response = await apiClient.delete(`/cart/items/remove`, { data: { itemIds } })
      console.log("Item removed from cart:", response.data)
      return response.data
    } catch (error) {
      console.error("Error removing item from cart:", error)
      throw error
    }
  },

  // Clear the entire cart
  clearCart: async () => {
    try {
      const response = await apiClient.delete("/cart")
      return response.data
    } catch (error) {
      console.error("Error clearing cart:", error)
      throw error
    }
  },

  // Sync the local cart with the server
  syncCart: async (items: CartItem[]) => {
    try {
      const response = await apiClient.post("/cart/sync", { items })
      return response.data
    } catch (error) {
      console.error("Error syncing cart:", error)
      throw error
    }
  },
}

export default CartService
