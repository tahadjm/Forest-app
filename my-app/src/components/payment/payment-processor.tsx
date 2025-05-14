"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { PaymentService } from "@/services/payment-service"
import { Loader2, AlertCircle, CreditCard, LogIn } from "lucide-react"
import { toast } from "react-hot-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuth } from "@/context/auth-context"
import { useAuthModal } from "@/hooks/use-auth-modal"
import { getToken } from "@/utils/auth"

interface PaymentProcessorProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  totalAmount: number
}

export function PaymentProcessor({ isOpen, onClose, totalAmount }: PaymentProcessorProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { isAuthenticated } = useAuth()
  const { onOpen: openAuthModal } = useAuthModal()

  const handlePayment = async () => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      toast.error("Veuillez vous connecter pour effectuer un paiement")
      onClose()
      openAuthModal()
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Store the auth token in sessionStorage before redirecting
      const token = getToken()
      if (token) {
        sessionStorage.setItem("paymentAuthToken", token)
      }

      const response = await PaymentService.createCheckout()
      console.log("Chargily response:", response)

      if (!response.checkout_url) {
        throw new Error("URL de paiement non disponible")
      }

      // Store the payment ID for reference on the success page
      if (response.id) {
        sessionStorage.setItem("lastPaymentId", response.id)
      }

      // Redirect to Chargily checkout page
      window.location.href = response.checkout_url

      // REMOVE THIS - Don't call onSuccess here as payment hasn't completed yet
      // if (onSuccess) {
      //   onSuccess()
      // }
    } catch (err: any) {
      console.error("Payment error:", err)
      setError(err.response?.data?.message || "Une erreur est survenue lors du traitement du paiement")
      toast.error("Erreur de paiement")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Procéder au paiement</DialogTitle>
          <DialogDescription>
            Vous allez être redirigé vers la plateforme de paiement sécurisée Chargily.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {!isAuthenticated ? (
            <Alert className="mb-4">
              <LogIn className="h-4 w-4" />
              <AlertTitle>Connexion requise</AlertTitle>
              <AlertDescription>
                Vous devez être connecté pour effectuer un paiement.
                <Button
                  variant="link"
                  className="p-0 h-auto font-normal text-sm underline ml-1"
                  onClick={() => {
                    onClose()
                    openAuthModal()
                  }}
                >
                  Se connecter
                </Button>
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="rounded-lg bg-muted p-4 mb-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Montant total</span>
                  <span className="text-xl font-bold">{totalAmount.toFixed(2)} DZD</span>
                </div>
              </div>

              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Erreur</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="text-sm text-muted-foreground space-y-2">
                <p>
                  En cliquant sur "Payer maintenant", vous serez redirigé vers Chargily pour finaliser votre paiement en
                  toute sécurité.
                </p>
                <p>Après le paiement, vous serez automatiquement redirigé vers notre site.</p>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          <Button
            onClick={handlePayment}
            disabled={loading || !isAuthenticated}
            className="bg-adventure-500 hover:bg-adventure-600 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Traitement...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Payer maintenant
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
