"use client"

import type React from "react"

import { create } from "zustand"
import { createContext, useContext, useState } from "react"

// Modal store using Zustand
interface ModalState {
  isOpen: boolean
  setOpen: (open: boolean) => void
}

export const useModalStore = create<ModalState>((set) => ({
  isOpen: false,
  setOpen: (open) => set({ isOpen: open }),
}))

// Context for modal provider
interface ModalContextType {
  isOpen: boolean
  setOpen: (open: boolean) => void
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false)

  return <ModalContext.Provider value={{ isOpen, setOpen: setIsOpen }}>{children}</ModalContext.Provider>
}

// Hook to use the modal context
export const useModalContext = () => {
  const context = useContext(ModalContext)
  if (context === undefined) {
    throw new Error("useModalContext must be used within a ModalProvider")
  }
  return context
}
