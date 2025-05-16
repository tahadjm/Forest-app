"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"
import type { CartItem } from "./cart-panel"

interface CartContextType {
  items: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (id: string) => void
  updateCartItem: (id: string, updates: Partial<CartItem>) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([])

  const addToCart = useCallback((item: CartItem) => {
    setItems((prevItems) => [...prevItems, item])
  }, [])

  const removeFromCart = useCallback((id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id))
  }, [])

  const updateCartItem = useCallback((id: string, updates: Partial<CartItem>) => {
    setItems((prevItems) => prevItems.map((item) => (item.id === id ? { ...item, ...updates } : item)))
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateCartItem, clearCart }}>
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
