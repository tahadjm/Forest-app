"use client"

import { create } from "zustand"
import { useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"

type AuthView = "login" | "signup" | "forgotPassword"

interface AuthModalStore {
  isOpen: boolean
  view: AuthView
  onOpen: () => void
  onClose: () => void
  setView: (view: AuthView) => void
}

export const useAuthModal = create<AuthModalStore>((set) => ({
  isOpen: false,
  view: "login",
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
  setView: (view) => set({ view, isOpen: true }),
}))

// Hook to handle URL parameters for auth modal
export const useAuthModalWithURLParams = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const authParam = searchParams?.get("auth")
  const callbackUrl = searchParams?.get("callbackUrl")

  const { setView, onOpen, onClose } = useAuthModal()

  // Handle URL parameters
  useEffect(() => {
    if (authParam) {
      if (authParam === "login" || authParam === "signup" || authParam === "forgotPassword") {
        setView(authParam as AuthView)
      } else {
        setView("login") // Default to login if param is invalid
      }
      onOpen()
    }
  }, [authParam, setView, onOpen])

  // Enhanced close function that cleans up URL parameters
  const handleClose = () => {
    onClose()

    // Clean up URL if auth param exists
    if (authParam) {
      const url = new URL(window.location.href)
      url.searchParams.delete("auth")

      // Keep the callbackUrl parameter
      if (callbackUrl) {
        url.searchParams.set("callbackUrl", callbackUrl)
      } else {
        url.searchParams.delete("callbackUrl")
      }

      router.replace(url.pathname + url.search)
    }
  }

  return {
    ...useAuthModal.getState(),
    onClose: handleClose,
    callbackUrl,
  }
}
