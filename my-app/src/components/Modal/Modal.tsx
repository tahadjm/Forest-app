"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { LoginForm } from "@/components/auth/login-form"
import { SignupForm } from "@/components/auth/signup-form"
import { useAuthModalStore } from "@/store/useModalStore"

const Modal = () => {
  const { isOpen, closeModal } = useAuthModalStore()
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin")

  const switchToSignup = () => {
    setActiveTab("signup")
  }

  const switchToSignin = () => {
    setActiveTab("signin")
  }

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            {activeTab === "signin" ? "Welcome Back" : "Create Account"}
          </DialogTitle>
        </DialogHeader>
        {activeTab === "signin" ? (
          <LoginForm switchToSignup={switchToSignup} />
        ) : (
          <SignupForm switchToSignin={switchToSignin} />
        )}
      </DialogContent>
    </Dialog>
  )
}

export default Modal
