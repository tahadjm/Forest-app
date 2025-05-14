"use client"

import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/cart-store"
import { useAuth } from "@/context/auth-context"

export function CartButton() {
  const { setIsOpen } = useCartStore()
  const { isAuthenticated } = useAuth()

  // Don't render if user is not authenticated
  if (!isAuthenticated) {
    return null
  }

  return (
    <Button
      onClick={() => setIsOpen(true)}
      variant="ghost"
      size="icon"
      className="relative"
      aria-label="Ouvrir le panier"
    >
      <ShoppingCart className="h-5 w-5" />
    </Button>
  )
}
