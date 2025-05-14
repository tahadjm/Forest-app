"use client"

import { useEffect, useState } from "react"
import React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Calendar, Clock, Users, DollarSign, CheckCircle, XCircle, MapPin, QrCode } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { BookingService } from "@/services/booking-service"
import { format } from "date-fns"
import Link from "next/link"
import toast from "react-hot-toast"
import { useAuth } from "@/context/auth-context"

export default function BookingDetailsPage({ params }: { params: { id: string } }) {
  const unwrappedParams = React.use(params)
  const { id } = unwrappedParams
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [markingAsUsed, setMarkingAsUsed] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    async function fetchBookingDetails() {
      try {
        setLoading(true)
        const response = await BookingService.getBookingById(id)
        if (response && response.data) {
          setBooking(response.data)
        } else {
          setError("Booking not found")
        }
      } catch (error) {
        console.error("Error fetching booking details:", error)
        setError("Failed to load booking details")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchBookingDetails()
    }
  }, [id])

  const handleMarkAsUsed = async () => {
    try {
      await BookingService.markBookingAsUsed(id)
      setBooking((prev: any) => ({ ...prev, used: true }))
      toast.success("Booking marked as used successfully")
      setMarkingAsUsed(false)
    } catch (error) {
      console.error("Error marking booking as used:", error)
      toast.error("Failed to mark booking as used")
    }
  }

  const handleCancelBooking = async () => {
    try {
      await BookingService.cancelBooking(id)
      setBooking((prev: any) => ({ ...prev, status: "cancelled" }))
      toast.success("Booking cancelled successfully")
      setShowCancelDialog(false)
    } catch (error) {
      console.error("Error cancelling booking:", error)
      toast.error("Failed to cancel booking")
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "PPP")
    } catch (error) {
      return dateString
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
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" disabled>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Skeleton className="h-10 w-48" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-8">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-8 w-full" />
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Error</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button asChild>
            <Link href="/dashboard/bookings">Back to Bookings</Link>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  if (!booking) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Booking Not Found</CardTitle>
          <CardDescription>The requested booking could not be found.</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button asChild>
            <Link href="/dashboard/bookings">Back to Bookings</Link>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  const isManager = user?.role === "admin" || user?.role === "sous admin"
  const canCancel = booking.status !== "cancelled" && (isManager || booking.paymentStatus !== "paid")
  const canMarkAsUsed = isManager && booking.status === "confirmed" && !booking.used

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/dashboard/bookings">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Booking Details</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">Booking #{booking.TicketCode || booking._id}</CardTitle>
              <CardDescription>Created on {formatDate(booking.createdAt || booking.date)}</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              {getStatusBadge(booking.status)}
              {getPaymentStatusBadge(booking.paymentStatus)}
              {booking.used ? <Badge className="bg-blue-500">Used</Badge> : <Badge variant="outline">Unused</Badge>}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Customer Information</h3>
                <div className="rounded-lg border p-4 space-y-2">
                  <p className="font-medium">{booking.user?.name || booking.user?.username}</p>
                  <p className="text-muted-foreground">{booking.user?.email}</p>
                  <p className="text-muted-foreground">{booking.user?.phone}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Booking Details</h3>
                <div className="rounded-lg border p-4 space-y-4">
                  <div className="flex items-start gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Date</p>
                      <p className="text-muted-foreground">{formatDate(booking.date)}</p>
                    </div>
                  </div>

                  {booking.startTime && booking.endTime && (
                    <div className="flex items-start gap-2">
                      <Clock className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Time Slot</p>
                        <p className="text-muted-foreground">
                          {booking.startTime} - {booking.endTime}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-2">
                    <Users className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Number of People</p>
                      <p className="text-muted-foreground">{booking.quantity}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <DollarSign className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Total Price</p>
                      <p className="text-muted-foreground">${booking.totalPrice?.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Park Information</h3>
                <div className="rounded-lg border p-4 space-y-4">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">{booking.park?.name}</p>
                      <p className="text-muted-foreground">{booking.park?.location}</p>
                    </div>
                  </div>
                </div>
              </div>

              {booking.activity && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Activity Information</h3>
                  <div className="rounded-lg border p-4">
                    <p className="font-medium">{booking.activity.name}</p>
                    <p className="text-muted-foreground">{booking.activity.description}</p>
                  </div>
                </div>
              )}

              {booking.TicketCode && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Ticket Information</h3>
                  <div className="rounded-lg border p-4 text-center">
                    <div className="mb-4">
                      <QrCode className="h-24 w-24 mx-auto mb-2" />
                      <p className="font-mono font-medium">{booking.TicketCode}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">Present this QR code at the entrance for admission</p>
                  </div>
                </div>
              )}

              {booking.specialRequests && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Special Requests</h3>
                  <div className="rounded-lg border p-4">
                    <p className="text-muted-foreground">{booking.specialRequests}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-4 justify-end">
          {canCancel && (
            <Button variant="outline" onClick={() => setShowCancelDialog(true)}>
              <XCircle className="mr-2 h-4 w-4" />
              Cancel Booking
            </Button>
          )}
          {canMarkAsUsed && (
            <Button onClick={() => setMarkingAsUsed(true)}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark as Used
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Mark as Used Dialog */}
      <Dialog open={markingAsUsed} onOpenChange={setMarkingAsUsed}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark ticket as used?</DialogTitle>
            <DialogDescription>This will mark the ticket as used. This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMarkingAsUsed(false)}>
              Cancel
            </Button>
            <Button onClick={handleMarkAsUsed}>Mark as Used</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Booking Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel this booking?</DialogTitle>
            <DialogDescription>
              This will mark the booking as cancelled. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Go Back
            </Button>
            <Button variant="destructive" onClick={handleCancelBooking}>
              Cancel Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
