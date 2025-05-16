"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

/**
 * Client component that listens for cart update events and refreshes the page
 */
export function CartUpdateProvider() {
  const router = useRouter()

  useEffect(() => {
    const handleCartUpdate = () => {
      console.log("Cart updated, refreshing page")
      router.refresh()
    }

    window.addEventListener("cart-updated", handleCartUpdate)

    return () => {
      window.removeEventListener("cart-updated", handleCartUpdate)
    }
  }, [router])

  // This component doesn't render anything
  return null
}
