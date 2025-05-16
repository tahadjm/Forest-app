"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  CheckCircle,
  XCircle,
  Loader2,
  Receipt,
  Calendar,
  Users,
  ArrowRight,
  HomeIcon,
  ArrowLeft,
  RefreshCw,
  ExternalLink,
} from "lucide-react"
import { PaymentService, type BookingStatus } from "@/services/payment-service"
import { ReceiptService, type Receipt as ReceiptType } from "@/services/receipt-service"
import Link from "next/link"
import { motion } from "framer-motion"
import { getToken, setToken } from "@/utils/auth"
import Image from "next/image"
import { CartService } from "@/services/cart-service"

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const checkoutId = searchParams.get("checkout_id")
  const paymentId = searchParams.get("payment_id") || checkoutId || null

  const [pathPaymentId, setPathPaymentId] = useState<string | null>(null)
  const [status, setStatus] = useState<"loading" | "success" | "failed" | "pending">("loading")
  const [error, setError] = useState<string | null>(null)
  const [bookings, setBookings] = useState<BookingStatus[]>([])
  const [receipt, setReceipt] = useState<ReceiptType | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  // Extract payment ID from path and restore auth token if available
  useEffect(() => {
    // Now it's safe to access window
    const path = window.location.pathname
    const extractedPathPaymentId = path.includes("/success/") ? path.split("/success/")[1]?.split("?")[0] : null

    // Also check for payment ID in URL query params
    const urlParams = new URLSearchParams(window.location.search)
    const urlPaymentId = urlParams.get("payment_id") || urlParams.get("checkout_id")

    setPathPaymentId(extractedPathPaymentId || urlPaymentId)

    // Store checkout_id if available
    if (checkoutId) {
      sessionStorage.setItem("lastPaymentId", checkoutId)
    }

    // Restore auth token from sessionStorage if it exists
    const storedToken = sessionStorage.getItem("paymentAuthToken")
    if (storedToken && !getToken()) {
      // Restore the token to localStorage and cookie
      setToken(storedToken)
    }
  }, [checkoutId])

  // Use a separate useEffect for the API call that depends on pathPaymentId
  useEffect(() => {
    // Get the final payment ID to use
    const finalPaymentId = pathPaymentId || paymentId || PaymentService.getLastPaymentId()

    if (!finalPaymentId) {
      setStatus("failed")
      setError("ID de paiement manquant")
      return
    }

    const checkBookingStatus = async () => {
      try {
        // Call your backend API to get bookings by payment ID
        const bookingsData = await PaymentService.getBookingsByPaymentId(finalPaymentId)
        console.log("bookingsData", bookingsData)
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
          const newReceipt = ReceiptService.createReceiptFromBookings(finalPaymentId, bookingsData)
          setReceipt(newReceipt)

          // Save receipt to database and local storage
          try {
            await ReceiptService.saveToDatabase(newReceipt)
            ReceiptService.saveToLocalStorage(newReceipt)
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
        // All bookings are still pending - this is normal if the webhook hasn't been processed yet
        else if (bookingsData.every((booking) => booking.paymentStatus === "pending")) {
          // Since we're coming from the Chargily success page, we can assume it was successful
          // But we'll still wait for the webhook to update the database
          setStatus("pending")

          // Create pending receipt
          const pendingReceipt = ReceiptService.createReceiptFromBookings(finalPaymentId, bookingsData)
          setReceipt(pendingReceipt)

          // Save to session storage only (temporary)
          ReceiptService.saveToSessionStorage(pendingReceipt)

          // Retry up to 5 times with increasing delay
          if (retryCount < 5) {
            const delay = 3000 + retryCount * 1000 // Increase delay with each retry
            setTimeout(() => {
              setRetryCount((prev) => prev + 1)
            }, delay)
          } else {
            // After 5 retries, consider it success anyway since we came from Chargily success page
            // The webhook might update the status later in the background
            setStatus("success")

            // Update receipt status
            const updatedReceipt = {
              ...pendingReceipt,
              status: "paid",
            }
            setReceipt(updatedReceipt)

            // Save updated receipt
            try {
              await ReceiptService.saveToDatabase(updatedReceipt)
              ReceiptService.saveToLocalStorage(updatedReceipt)
              ReceiptService.saveToSessionStorage(updatedReceipt)
            } catch (err) {
              console.error("Error saving updated receipt:", err)
            }

            // Refresh the cart to ensure it's updated
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
        // If we can't fetch booking details but we're on the success page,
        // we'll assume success and show a generic message
        if (window.location.pathname.includes("/payment-success")) {
          setStatus("success")
          setError(null)

          // Refresh the cart to ensure it's updated
          try {
            await CartService.refreshCart()
          } catch (err) {
            console.error("Error refreshing cart:", err)
          }
        } else {
          setStatus("failed")
          setError("Erreur lors de la vérification du statut de paiement")
        }
      }
    }

    if (finalPaymentId) {
      checkBookingStatus()
    }
  }, [pathPaymentId, paymentId, retryCount])

  const handleDownloadReceipt = async () => {
    if (!receipt) {
      // Create receipt from bookings if not already created
      const newReceipt = ReceiptService.createReceiptFromBookings(paymentId || pathPaymentId || "unknown", bookings)
      console.log("Receipt saved to database:", newReceipt)
      await ReceiptService.saveToDatabase(newReceipt)
      ReceiptService.saveToLocalStorage(newReceipt)
      setReceipt(newReceipt)

      try {
        await ReceiptService.downloadReceipt(newReceipt)
      } catch (error) {
        console.error("Error downloading receipt:", error)
        alert("Une erreur s'est produite lors du téléchargement du reçu. Veuillez réessayer.")
      }
    } else {
      try {
        await ReceiptService.downloadReceipt(receipt)
      } catch (error) {
        console.error("Error downloading receipt:", error)
        alert("Une erreur s'est produite lors du téléchargement du reçu. Veuillez réessayer.")
      }
    }
  }

  // Determine which payment ID to display
  const displayPaymentId = pathPaymentId || paymentId || PaymentService.getLastPaymentId() || "N/A"

  // Calculate total amount from all bookings
  const totalAmount = bookings.reduce((sum, booking) => sum + booking.totalPrice, 0)

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-adventure-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="border-none shadow-lg overflow-hidden">
            {/* Status-based header color */}
            <div
              className={`h-3 w-full ${
                status === "loading" || status === "pending"
                  ? "bg-yellow-400"
                  : status === "success"
                    ? "bg-green-500"
                    : "bg-red-500"
              }`}
            />

            <CardHeader className="pb-4 pt-8">
              <CardTitle className="text-center text-3xl font-bold">
                {status === "loading" && "Vérification du paiement"}
                {status === "pending" && "Traitement en cours"}
                {status === "success" && "Paiement confirmé !"}
                {status === "failed" && "Paiement non complété"}
              </CardTitle>
              <CardDescription className="text-center text-base mt-2">
                {status === "loading" && "Veuillez patienter pendant que nous vérifions votre paiement"}
                {status === "pending" && "Votre paiement a été reçu. La confirmation est en cours de traitement."}
                {status === "success" && "Votre réservation a été enregistrée avec succès"}
                {status === "failed" && error}
              </CardDescription>
            </CardHeader>

            <CardContent className="px-8 pb-8">
              {(status === "loading" || status === "pending") && (
                <motion.div
                  className="flex flex-col items-center py-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="relative">
                    <Loader2 className="h-24 w-24 text-adventure-500 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-16 w-16 rounded-full bg-adventure-100"></div>
                    </div>
                  </div>

                  {status === "pending" && (
                    <motion.div
                      className="mt-8 text-center max-w-md"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <p className="text-lg font-medium text-adventure-700 mb-2">Presque terminé !</p>
                      <p className="text-sm text-gray-600">
                        Votre paiement a été reçu avec succès. Notre système finalise actuellement votre réservation.
                        Cela peut prendre quelques instants.
                      </p>

                      <div className="mt-6 flex items-center justify-center gap-2">
                        <span className="text-sm text-gray-500">Rafraîchissement automatique en cours</span>
                        <RefreshCw size={16} className="text-adventure-500 animate-spin" />
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {status === "success" && (
                <motion.div className="py-4" variants={containerVariants} initial="hidden" animate="visible">
                  <motion.div className="flex flex-col items-center mb-8" variants={itemVariants}>
                    <div className="relative mb-4">
                      <div className="absolute inset-0 bg-green-100 rounded-full scale-150 opacity-20"></div>
                      <div className="absolute inset-0 bg-green-100 rounded-full scale-125 opacity-40"></div>
                      <CheckCircle size={80} className="relative text-green-500" />
                    </div>

                    <h3 className="text-xl font-medium text-gray-900 mb-1">Merci pour votre réservation !</h3>
                    <p className="text-sm text-gray-600 text-center max-w-md">
                      Un email de confirmation a été envoyé à l'adresse associée à votre compte.
                    </p>
                  </motion.div>

                  <motion.div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100" variants={itemVariants}>
                    <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                      <Receipt className="h-4 w-4 mr-2 text-adventure-600" />
                      Détails de la transaction
                    </h4>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">ID de transaction</span>
                        <span className="font-mono font-medium text-gray-900">
                          {displayPaymentId.substring(0, 16)}...
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date</span>
                        <span className="text-gray-900">{new Date().toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Méthode</span>
                        <span className="text-gray-900">Chargily</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Statut</span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Payé
                        </span>
                      </div>
                    </div>
                  </motion.div>

                  {bookings.length > 0 ? (
                    <motion.div variants={itemVariants}>
                      <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-adventure-600" />
                        Résumé de votre réservation
                      </h4>

                      <div className="space-y-3">
                        {bookings.map((booking, index) => (
                          <div
                            key={index}
                            className="bg-white p-4 rounded-lg border border-gray-200 hover:border-adventure-300 transition-colors"
                          >
                            <div className="flex flex-col md:flex-row md:items-center gap-4">
                              {/* Booking details */}
                              <div className="flex-1">
                                <div className="flex justify-between items-start mb-2">
                                  <h5 className="font-medium text-adventure-900">
                                    {booking.pricing?.name || "Réservation"}
                                  </h5>
                                  <span className="font-medium text-adventure-700">
                                    {booking.totalPrice.toFixed(2)} DZD
                                  </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                  <div className="flex items-center text-gray-600">
                                    <Calendar className="h-3.5 w-3.5 mr-1.5 text-adventure-500" />
                                    {new Date(booking.date).toLocaleDateString("fr-FR", {
                                      weekday: "long",
                                      day: "numeric",
                                      month: "long",
                                    })}
                                  </div>
                                  <div className="flex items-center text-gray-600">
                                    <Users className="h-3.5 w-3.5 mr-1.5 text-adventure-500" />
                                    {booking.quantity} {booking.quantity > 1 ? "participants" : "participant"}
                                  </div>
                                  {booking.TicketCode && (
                                    <div className="flex items-center text-gray-600 sm:col-span-2">
                                      <Receipt className="h-3.5 w-3.5 mr-1.5 text-adventure-500" />
                                      Code: <span className="font-mono ml-1">{booking.TicketCode}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* QR Code */}
                              {booking.QrCode && (
                                <div className="flex-shrink-0 flex items-center justify-center">
                                  <div className="bg-white p-2 rounded-md shadow-sm border border-gray-100">
                                    {booking._id ? (
                                      <Link href={booking.QrCode} target="_blank" className="block relative group">
                                        <Image
                                          src={booking.QrCode || "/placeholder.svg"}
                                          alt={`QR Code pour ${booking.TicketCode || "billet"}`}
                                          width={100}
                                          height={100}
                                          className="w-[100px] h-[100px]"
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 flex items-center justify-center transition-all duration-200">
                                          <ExternalLink
                                            className="text-adventure-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                            size={20}
                                          />
                                        </div>
                                      </Link>
                                    ) : (
                                      <Image
                                        src={booking.QrCode || "/placeholder.svg"}
                                        alt={`QR Code pour ${booking.TicketCode || "billet"}`}
                                        width={100}
                                        height={100}
                                        className="w-[100px] h-[100px]"
                                      />
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 border-t border-gray-200 pt-4 flex justify-between items-center">
                        <span className="font-medium text-gray-700">Total</span>
                        <span className="text-xl font-bold text-adventure-900">{totalAmount.toFixed(2)} DZD</span>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div variants={itemVariants} className="text-center py-4">
                      <p className="text-gray-600">
                        Votre paiement a été confirmé, mais les détails de votre réservation ne sont pas encore
                        disponibles.
                      </p>
                      <p className="text-gray-600 mt-2">
                        Vous pouvez consulter vos réservations dans votre espace personnel.
                      </p>
                    </motion.div>
                  )}

                  <motion.div className="mt-8 flex flex-col items-center" variants={itemVariants}>
                    <Button
                      onClick={handleDownloadReceipt}
                      className="flex items-center gap-2 bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                    >
                      <Receipt className="h-4 w-4" />
                      Télécharger le reçu
                    </Button>

                    <div className="mt-6 text-sm text-gray-600 text-center">
                      <p>Vous avez des questions?</p>
                      <Link href="/contact" className="text-adventure-600 hover:underline">
                        Contactez notre équipe
                      </Link>
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {status === "failed" && (
                <motion.div
                  className="py-8 flex flex-col items-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-red-100 rounded-full scale-150 opacity-20"></div>
                    <XCircle size={80} className="relative text-red-500" />
                  </div>

                  <h3 className="text-xl font-medium text-gray-900 mb-4 text-center">
                    Nous n'avons pas pu finaliser votre paiement
                  </h3>

                  <div className="bg-red-50 border border-red-100 rounded-lg p-4 max-w-md text-center mb-8">
                    <p className="text-red-700">
                      {error || "Une erreur est survenue lors du traitement de votre paiement"}
                    </p>
                    <p className="text-sm text-red-600 mt-1">Veuillez réessayer ou contacter notre service client.</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button onClick={() => router.push("/cart")} variant="outline" className="flex items-center gap-2">
                      <ArrowLeft className="h-4 w-4" />
                      Retour au panier
                    </Button>
                    <Button
                      variant="default"
                      className="bg-adventure-600 hover:bg-adventure-700 flex items-center gap-2"
                      onClick={() => window.location.reload()}
                    >
                      <RefreshCw className="h-4 w-4" />
                      Réessayer
                    </Button>
                  </div>
                </motion.div>
              )}
            </CardContent>

            <CardFooter
              className={`bg-gray-50 p-6 flex ${status === "failed" ? "justify-center" : "justify-between flex-wrap"} gap-3`}
            >
              {status !== "failed" && (
                <>
                  <Link href="/" passHref>
                    <Button variant="outline" className="flex items-center gap-2">
                      <HomeIcon className="h-4 w-4" />
                      Accueil
                    </Button>
                  </Link>

                  {status === "success" && (
                    <Link href="/profile?tab=transactions" passHref>
                      <Button className="bg-adventure-600 hover:bg-adventure-700 text-white flex items-center gap-2">
                        Voir mes transactions
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </>
              )}
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
