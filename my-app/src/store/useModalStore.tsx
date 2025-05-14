"use client"

import type React from "react"
import { createContext, useContext } from "react"
import { create } from "zustand"

// Rename to be more specific about what this store manages
interface AuthModalStore {
  isOpen: boolean
  openModal: () => void
  closeModal: () => void
}

// Rename to be more specific
export const useAuthModalStore = create<AuthModalStore>((set) => ({
  isOpen: false,
  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false }),
}))

// For backward compatibility, export the old name as well
export const useModalStore = useAuthModalStore

// ✅ Context API for React components
interface ModalContextType {
  isOpen: boolean
  openModal: () => void
  closeModal: () => void
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  const store = useModalStore() // Get Zustand state

  return <ModalContext.Provider value={store}>{children}</ModalContext.Provider>
}

export const useModalContext = () => {
  const context = useContext(ModalContext)
  if (!context) {
    throw new Error("useModalContext must be used within a ModalProvider")
  }
  return context
}
