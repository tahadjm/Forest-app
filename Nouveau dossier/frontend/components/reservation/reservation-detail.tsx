"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Users, CreditCard, AlertCircle } from "lucide-react"
import { cancelBooking } from "@/services/booking-service"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "react-hot-toast"
import { Loader2 } from "lucide-react"

interface Booking {
  _id: string
  user?: {
    _id: string
    name: string
    email: string
  }
  park?: {
    _id: string
    name: string
    address?: string
  }
  activity?: {
    _id: string
    name: string
  }
  timeSlotInstance?: {
    _id: string
    date: string
    startTime: string
    endTime: string
    availableTickets: number
    ticketLimit: number
  }
  date: string
  startTime?: string
  endTime?: string
  quantity: number
  totalPrice: number
  status: "pending" | "confirmed" | "cancelled" | "completed"
  paymentStatus: "pending" | "paid" | "failed"
  paymentId?: string
  paymentMethod?: "edahabia" | "cib"
  qrCode?: string
  createdAt?: string
  updatedAt?: string
}

interface ReservationDetailProps {
  booking: Booking
  onCancelled?: () => void
}

export function ReservationDetail({ booking, onCancelled }: ReservationDetailProps) {
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const router = useRouter()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (booking: any) => {
    if (booking.startTime && booking.endTime) {
      return `${booking.startTime} - ${booking.endTime}`
    }

    const date = new Date(booking.date)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
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

  const handleCancelBooking = async () => {
    setCancelling(true)
    try {
      await cancelBooking(booking._id)
      toast.success("Reservation cancelled successfully")
      if (onCancelled) {
        onCancelled()
      }
      setCancelDialogOpen(false)
    } catch (error) {
      console.error("Error cancelling booking:", error)
      toast.error("Failed to cancel reservation")
    } finally {
      setCancelling(false)
    }
  }

  const canCancel =
    booking.status !== "cancelled" && booking.status !== "completed" && new Date(booking.date) > new Date()

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="font-semibold text-xl">{booking.activity?.name || "Adventure Park Visit"}</h3>
            <p className="text-muted-foreground">{booking.park?.name}</p>
          </div>
          <div className="flex flex-col gap-2 items-end">
            {getStatusBadge(booking.status)}
            {getPaymentStatusBadge(booking.paymentStatus)}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <span>Date: {formatDate(booking.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <span>Time: {formatTime(booking)}</span>
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

        {booking.qrCode && (
          <div className="mt-6 flex flex-col items-center">
            <h3 className="font-medium mb-2">Ticket QR Code</h3>
            <div className="p-4 bg-white border rounded-md">
              <img src={booking.qrCode || "/placeholder.svg"} alt="Ticket QR Code" className="w-48 h-48" />
            </div>
            <p className="text-sm text-muted-foreground mt-2">Present this QR code at the entrance</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-muted/50 px-6 py-4 flex justify-between">
        <Button variant="outline" onClick={() => router.push("/reservation")}>
          Back to Reservations
        </Button>
        {canCancel && (
          <Button variant="destructive" onClick={() => setCancelDialogOpen(true)}>
            Cancel Reservation
          </Button>
        )}
      </CardFooter>

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
    </Card>
  )
}
