"use client"

import { useState, useEffect } from "react"
import React from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Users, CreditCard, AlertCircle } from "lucide-react"
import { BookingService } from "@/services/booking-service"
import { Loader2 } from "lucide-react"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "react-hot-toast"

export default function ReservationDetailPage({ params }: { params: { id: string } }) {
  const unwrappedParams = React.use(params)
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchBookingData = async () => {
      try {
        const response = await BookingService.getBookingById(unwrappedParams.id)
        if (response && response.data) {
          setBooking(response.data)
        } else {
          // If booking not found
          router.push("/reservation")
        }
      } catch (error) {
        console.error("Error fetching booking data:", error)
        router.push("/reservation")
      } finally {
        setLoading(false)
      }
    }

    fetchBookingData()
  }, [unwrappedParams.id, router])

  const handleCancelBooking = async () => {
    setCancelling(true)
    try {
      await BookingService.cancelBooking(booking._id)
      toast.success("Reservation cancelled successfully")
      // Update the booking status locally
      setBooking({ ...booking, status: "cancelled" })
      setCancelDialogOpen(false)
    } catch (error) {
      console.error("Error cancelling booking:", error)
      toast.error("Failed to cancel reservation")
    } finally {
      setCancelling(false)
    }
  }

  // Update the formatDate and formatTime functions to handle different date formats
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Invalid date"
    }
  }

  const formatTime = (dateString: string) => {
    if (!dateString) return "N/A"
    try {
      const date = new Date(dateString)
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (error) {
      console.error("Error formatting time:", error)
      return "Invalid time"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-500">Confirmed</Badge>
      case "pending":
        return <Badge variant="outline">Pending</Badge>
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>
      case "completed":
        return <Badge className="bg-blue-500">Completed</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-500">Paid</Badge>
      case "pending":
        return <Badge variant="outline">Pending</Badge>
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Reservation Not Found</CardTitle>
            <CardDescription>The reservation you're looking for could not be found.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push("/reservation")}>Back to Reservations</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Update the canCancel check to handle potential missing date
  const canCancel =
    booking.status !== "cancelled" &&
    booking.status !== "completed" &&
    booking.date &&
    new Date(booking.date) > new Date()

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-10">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Reservation Details</h1>
              <p className="text-muted-foreground">Booking reference: {booking._id}</p>
            </div>
            <Button onClick={() => router.push("/reservation")}>Back to Reservations</Button>
          </div>
          <Separator />

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{booking.activity?.name || "Adventure Park Visit"}</CardTitle>
                <div className="flex gap-2">
                  {getStatusBadge(booking.status)}
                  {getPaymentStatusBadge(booking.paymentStatus)}
                </div>
              </div>
              <CardDescription>{booking.park?.name || "Adventure Park"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <span>Date: {formatDate(booking.date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <span>Time: {formatTime(booking.date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <span>Location: {booking.park?.address || "Adventure Park Location"}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <span>Number of People: {booking.quantity}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <span>Total Price: ${booking.totalPrice.toFixed(2)}</span>
                  </div>
                  {booking.paymentMethod && (
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                      <span>Payment Method: {booking.paymentMethod}</span>
                    </div>
                  )}
                </div>
              </div>

              {booking.specialRequests && (
                <div className="mt-6">
                  <h3 className="font-medium mb-2">Special Requests:</h3>
                  <p className="text-muted-foreground">{booking.specialRequests}</p>
                </div>
              )}

              {booking.status === "cancelled" && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-red-800">This reservation has been cancelled</h3>
                    <p className="text-red-600 text-sm">
                      If you believe this was done in error, please contact customer support.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => router.push("/reservation")}>
                Back to Reservations
              </Button>
              {canCancel && (
                <Button variant="destructive" onClick={() => setCancelDialogOpen(true)}>
                  Cancel Reservation
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>

        <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel this reservation?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. The reservation will be marked as cancelled.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCancelDialogOpen(false)} disabled={cancelling}>
                Go Back
              </Button>
              <Button variant="destructive" onClick={handleCancelBooking} disabled={cancelling}>
                {cancelling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  "Cancel Reservation"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  )
}
