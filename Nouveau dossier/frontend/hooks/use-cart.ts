"use client"

import { useState, useEffect, useCallback } from "react"
import type { CartItem } from "@/types/cart"
import CartService from "@/services/cart-service"

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([])
  const [totalItems, setTotalItems] = useState(0)
  const [totalPrice, setTotalPrice] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch cart data
  const fetchCart = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const cartData = await CartService.getCart()

      if (cartData) {
        setItems(cartData.items || [])
        setTotalItems(cartData.totalItems || 0)
        setTotalPrice(cartData.totalPrice || 0)
      } else {
        // Reset cart if no data returned
        setItems([])
        setTotalItems(0)
        setTotalPrice(0)
      }
    } catch (err) {
      // Don't set error for 404 responses as they're expected when cart is empty
      if ((err as any).response?.status !== 404) {
        setError("Failed to load cart")
        console.error("Error fetching cart:", err)
      } else {
        // Reset cart on 404 (empty cart)
        setItems([])
        setTotalItems(0)
        setTotalPrice(0)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  // Initialize cart on component mount
  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  // Add item to cart
  const addItem = useCallback(async (item: CartItem) => {
    try {
      setLoading(true)
      const updatedCart = await CartService.addToCart(item)
      setItems(updatedCart.items || [])
      setTotalItems(updatedCart.totalItems || 0)
      setTotalPrice(updatedCart.totalPrice || 0)
      return true
    } catch (err) {
      setError("Failed to add item to cart")
      console.error("Error adding item to cart:", err)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  // Update item quantity
  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    try {
      setLoading(true)
      const updatedCart = await CartService.updateCartItem(itemId, quantity)
      setItems(updatedCart.items || [])
      setTotalItems(updatedCart.totalItems || 0)
      setTotalPrice(updatedCart.totalPrice || 0)
      return true
    } catch (err) {
      setError("Failed to update item quantity")
      console.error("Error updating item quantity:", err)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  // Remove item from cart
  const removeItem = useCallback(async (itemId: string) => {
    try {
      setLoading(true)
      const updatedCart = await CartService.removeFromCart(itemId)
      setItems(updatedCart.items || [])
      setTotalItems(updatedCart.totalItems || 0)
      setTotalPrice(updatedCart.totalPrice || 0)
      return true
    } catch (err) {
      setError("Failed to remove item from cart")
      console.error("Error removing item from cart:", err)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  // Clear entire cart
  const clearCart = useCallback(async () => {
    try {
      setLoading(true)
      await CartService.clearCart()
      setItems([])
      setTotalItems(0)
      setTotalPrice(0)
      return true
    } catch (err) {
      setError("Failed to clear cart")
      console.error("Error clearing cart:", err)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    items,
    totalItems,
    totalPrice,
    loading,
    error,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    refreshCart: fetchCart,
  }
}

export default useCart
