// useModalStore.ts
"use client"

import type React from "react"

import { createContext, useContext, useState } from "react"

interface ModalContextType {
  open: boolean
  setOpen: (open: boolean) => void
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false)

  return <ModalContext.Provider value={{ open, setOpen }}>{children}</ModalContext.Provider>
}

export const useModalStore = () => {
  const context = useContext(ModalContext)
  if (!context) {
    throw new Error("useModalStore must be used within a ModalProvider")
  }
  return context
}
