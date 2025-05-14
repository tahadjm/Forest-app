"use client"

import { useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { LoginForm } from "@/components/auth/login-form"
import { SignupForm } from "@/components/auth/signup-form"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"
import { useAuthModalWithURLParams } from "@/hooks/use-auth-modal"
import { useAuth } from "@/context/auth-context"
import { useRouter, useSearchParams } from "next/navigation"

export const AuthModal = () => {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams?.get("callbackUrl")

  // Use the enhanced hook that handles URL parameters
  const { isOpen, view, onClose, setView } = useAuthModalWithURLParams()

  // Check for auth parameter in URL on mount
  useEffect(() => {
    const authParam = searchParams?.get("auth")
    if (authParam === "login" || authParam === "signup" || authParam === "forgotPassword") {
      setView(authParam as any)
    }
  }, [searchParams, setView])

  // Close modal if user becomes authenticated
  useEffect(() => {
    if (isAuthenticated && isOpen) {
      onClose()

      // Redirect to callbackUrl after successful authentication
      if (callbackUrl) {
        router.push(callbackUrl)
      }
    }
  }, [isAuthenticated, isOpen, onClose, router, callbackUrl])

  const title = {
    login: "Login to your account",
    signup: "Create an account",
    forgotPassword: "Reset your password",
  }

  const description = {
    login: "Enter your credentials to access your account",
    signup: "Fill in your details to create a new account",
    forgotPassword: "Enter your email to receive a password reset link",
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-background/30 backdrop-blur-2xl border border-border/20 shadow-lg">
        <DialogHeader>
          <DialogTitle>{title[view]}</DialogTitle>
          <DialogDescription>{description[view]}</DialogDescription>
        </DialogHeader>
        {view === "login" && <LoginForm />}
        {view === "signup" && <SignupForm />}
        {view === "forgotPassword" && <ForgotPasswordForm />}
      </DialogContent>
    </Dialog>
  )
}
