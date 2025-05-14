"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Calendar, Clock, MapPin, Users } from "lucide-react"
import { cancelBooking } from "@/services/booking-service"
import { toast } from "react-hot-toast"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"

interface ReservationListProps {
  bookings: any[]
  type: "upcoming" | "past" | "cancelled"
}

export function ReservationList({ bookings, type }: ReservationListProps) {
  const router = useRouter()
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState(false)

  // Update the formatDate and formatTime functions to handle different date formats
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
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

  const handleCancelClick = (bookingId: string) => {
    setBookingToCancel(bookingId)
    setCancelDialogOpen(true)
  }

  const handleCancelConfirm = async () => {
    if (!bookingToCancel) return

    setCancelling(true)
    try {
      await cancelBooking(bookingToCancel)
      toast.success("Reservation cancelled successfully")
      // Refresh the page to update the booking list
      router.refresh()
    } catch (error) {
      console.error("Error cancelling booking:", error)
      toast.error("Failed to cancel reservation")
    } finally {
      setCancelling(false)
      setCancelDialogOpen(false)
      setBookingToCancel(null)
    }
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">
          {type === "upcoming" && "You don't have any upcoming reservations."}
          {type === "past" && "You don't have any past reservations."}
          {type === "cancelled" && "You don't have any cancelled reservations."}
        </p>
        {type === "upcoming" && <Button onClick={() => router.push("/park")}>Book an Adventure</Button>}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <Card key={booking._id} className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-lg">{booking.activity?.name || "Adventure Park Visit"}</h3>
                <p className="text-muted-foreground">{booking.park?.name || "Adventure Park"}</p>
              </div>
              <div className="flex flex-col gap-2 items-end">
                {getStatusBadge(booking.status || "pending")}
                <span className="text-sm font-medium">${(booking.totalPrice || 0).toFixed(2)}</span>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{formatDate(booking.date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{formatTime(booking.date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{booking.park?.address || "Adventure Park"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{booking.quantity || 0} people</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/50 px-6 py-3 flex justify-between">
            <Button variant="outline" size="sm" onClick={() => router.push(`/reservation/${booking._id}`)}>
              View Details
            </Button>

            {type === "upcoming" && booking.status !== "cancelled" && (
              <Button variant="destructive" size="sm" onClick={() => handleCancelClick(booking._id)}>
                Cancel
              </Button>
            )}
          </CardFooter>
        </Card>
      ))}

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
            <Button variant="destructive" onClick={handleCancelConfirm} disabled={cancelling}>
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
  )
}
