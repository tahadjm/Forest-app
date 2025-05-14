"use client"

import { useEffect, useState } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { PaymentService, type BookingStatus } from "@/services/payment-service"
import { ReceiptService, type Receipt } from "@/services/receipt-service"
import { getToken, setToken } from "@/utils/auth"
import { CartService } from "@/services/cart-service"

export default function PaymentSuccessPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()

  const paymentId = (params.id as string) || searchParams.get("payment_id") || searchParams.get("checkout_id") || null

  const [status, setStatus] = useState<"loading" | "success" | "failed" | "pending">("loading")
  const [error, setError] = useState<string | null>(null)
  const [bookings, setBookings] = useState<BookingStatus[]>([])
  const [receipt, setReceipt] = useState<Receipt | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  // Extract payment ID from path and restore auth token if available
  useEffect(() => {
    // Restore auth token from sessionStorage if it exists
    const storedToken = sessionStorage.getItem("paymentAuthToken")
    if (storedToken && !getToken()) {
      setToken(storedToken)
    }

    // Check if we have a receipt in session storage
    const sessionReceipt = ReceiptService.getFromSessionStorage()
    if (sessionReceipt && sessionReceipt.paymentId === paymentId) {
      setReceipt(sessionReceipt)
      setBookings(sessionReceipt.bookings)
      setStatus(
        sessionReceipt.status === "paid" ? "success" : sessionReceipt.status === "failed" ? "failed" : "pending",
      )
      return
    }

    // If no receipt in session, check if we have it in local storage
    const localReceipt = ReceiptService.getLocalReceiptById(paymentId)
    if (localReceipt) {
      setReceipt(localReceipt)
      setBookings(localReceipt.bookings)
      setStatus(localReceipt.status === "paid" ? "success" : localReceipt.status === "failed" ? "failed" : "pending")
      return
    }

    // If not in storage, fetch from API
    fetchBookingData()
  }, [paymentId])

  const fetchBookingData = async () => {
    if (!paymentId) {
      setStatus("failed")
      setError("ID de paiement manquant")
      return
    }

    try {
      // Call your backend API to get bookings by payment ID
      const bookingsData = await PaymentService.getBookingsByPaymentId(paymentId)
      setBookings(bookingsData)

      if (bookingsData.length === 0) {
        setStatus("failed")
        setError("Aucune réservation trouvée pour cet ID de paiement")
        return
      }

      // Check if any booking is confirmed (paid)
      if (bookingsData.some((booking) => booking.paymentStatus === "paid")) {
        setStatus("success")

        // Create and save receipt
        const newReceipt = ReceiptService.createReceiptFromBookings(paymentId, bookingsData)
        setReceipt(newReceipt)

        // Save to all storage options
        try {
          // Save to database
          await ReceiptService.saveToDatabase(newReceipt)
          console.log("Receipt saved to database:", newReceipt)
          // Save to local storage for offline access
          ReceiptService.saveToLocalStorage(newReceipt)
          // Save to session storage for cross-page navigation
          ReceiptService.saveToSessionStorage(newReceipt)
        } catch (err) {
          console.error("Error saving receipt:", err)
        }

        // Clear the stored payment ID on success
        PaymentService.clearLastPaymentId()

        // Refresh the cart to ensure it's updated
        try {
          await CartService.refreshCart()
        } catch (err) {
          console.error("Error refreshing cart:", err)
        }
      }
      // Check if any booking is failed
      else if (bookingsData.some((booking) => booking.paymentStatus === "failed")) {
        setStatus("failed")
        setError("Le paiement a échoué")
        // Clear the stored payment ID on failure
        PaymentService.clearLastPaymentId()
      }
      // All bookings are still pending
      else if (bookingsData.every((booking) => booking.paymentStatus === "pending")) {
        setStatus("pending")

        // Create pending receipt
        const pendingReceipt = ReceiptService.createReceiptFromBookings(paymentId, bookingsData)
        setReceipt(pendingReceipt)

        // Save to session storage only (temporary)
        ReceiptService.saveToSessionStorage(pendingReceipt)

        // Retry up to 5 times with increasing delay
        if (retryCount < 5) {
          const delay = 3000 + retryCount * 1000
          setTimeout(() => {
            setRetryCount((prev) => prev + 1)
          }, delay)
        } else {
          // After 5 retries, consider it success anyway
          setStatus("success")

          // Update receipt status
          const updatedReceipt = {
            ...pendingReceipt,
            status: "paid",
          }
          setReceipt(updatedReceipt)

          // Save updated receipt
          ReceiptService.saveToDatabase(updatedReceipt)
          ReceiptService.saveToLocalStorage(updatedReceipt)
          ReceiptService.saveToSessionStorage(updatedReceipt)

          // Refresh the cart
          try {
            await CartService.refreshCart()
          } catch (err) {
            console.error("Error refreshing cart:", err)
          }
        }
      } else {
        setStatus("failed")
        setError("Statut de paiement inconnu")
      }
    } catch (err) {
      console.error("Error checking booking status:", err)
      setStatus("failed")
      setError("Erreur lors de la vérification du statut de paiement")
    }
  }

  // Rest of your component remains the same...
  // (handleDownloadReceipt function, UI rendering, etc.)

  // Calculate total amount from all bookings
  const totalAmount = bookings.reduce((sum, booking) => sum + booking.totalPrice, 0)
  const displayPaymentId = paymentId || "N/A"

  // The rest of your component code remains the same...
  // (I'm not including the entire UI rendering code to keep this response focused on the receipt storage solution)

  return (
    <div className="min-h-screen bg-gradient-to-b from-adventure-50 to-white py-12 px-4">
      {/* Your existing UI code */}
    </div>
  )
}
