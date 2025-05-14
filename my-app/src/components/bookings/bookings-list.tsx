"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Edit, MoreHorizontal, Trash, QrCode } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { z } from "zod"
import { ParkService } from "@/services/park-service"
import { BookingService } from "@/services/booking-service"
import { AuthService } from "@/services/auth-service"
import toast from "react-hot-toast"
import { Skeleton } from "@/components/ui/skeleton"
import type { Park } from "@/types/Park"
import type { IBooking as Booking } from "@/types/booking"

// Define the Booking type

export const bookingValidation = z.object({
  user: z.string().min(1, "User ID is required"),
  park: z.string().min(1, "Park ID is required"),
  pricing: z.string().min(1, "Pricing ID is required"),
  type: z.enum(["parcours", "activity"]),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/, "Invalid ISO date format"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  totalPrice: z.number().min(0, "Total price must be 0 or greater"),
  status: z.enum(["pending", "confirmed", "cancelled"]).default("pending"),
  paymentStatus: z.enum(["pending", "paid", "failed"]).default("pending"),
  paymentId: z.string().optional(),
  paymentMethod: z.enum(["edahabia", "cib"]).optional(),
})

export function BookingsList() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [bookingToDelete, setBookingToDelete] = useState<string | null>(null)
  const [parks, setParks] = useState<Park[]>([])
  const [selectedPark, setSelectedPark] = useState<string | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null)
  const [qrCodeSearch, setQrCodeSearch] = useState("")
  const [markingAsUsed, setMarkingAsUsed] = useState(false)
  const [bookingToMarkAsUsed, setBookingToMarkAsUsed] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const role = await AuthService.getUserRole()
        setUserRole(role)
      } catch (error) {
        console.error("Error fetching user role:", error)
      }
    }

    fetchUserRole()
  }, [])
  console.log(userRole)
  // Fetch parks based on user role
  useEffect(() => {
    const fetchParks = async () => {
      if (userRole === null) return // Wait until we know the user role

      try {
        if (userRole === "admin") {
          // Admin can see all parks
          const response = await ParkService.getAllParks()
          if (response?.data && Array.isArray(response.data)) {
            const parksList = response.data.map((park: any) => ({
              _id: park._id,
              name: park.name,
            }))
            setParks(parksList)
          }
        } else {
          // Sous admin or regular user can only see their assigned park(s)
          const response = await ParkService.getParkForCurrentUser()
          if (response?.data && Array.isArray(response.data)) {
            const parksList = response.data.map((park: any) => ({
              _id: park._id,
              name: park.name,
            }))
            setParks(parksList)

            // If there's only one park, select it automatically
            if (parksList.length === 1) {
              setSelectedPark(parksList[0]._id)
            }
          } else if (response.data) {
            // Single park case
            setParks([
              {
                _id: response.data._id,
                name: response.data.name,
              },
            ])
            setSelectedPark(response.data._id)
          }
        }
      } catch (error) {
        console.error("Error fetching parks:", error)
        toast.error("Failed to load parks")
      }
    }

    fetchParks()
  }, [userRole])

  console.log(parks)

  // Fetch bookings
  useEffect(() => {
    const fetchBookingData = async () => {
      if (parks.length === 0) return

      setIsLoading(true)
      try {
        let allBookings: Booking[] = []

        // If a specific park is selected
        if (selectedPark && selectedPark !== "all") {
          console.log("Fetching bookings for specific park:", selectedPark)
          const parkName = parks.find((park) => park._id === selectedPark)?.name || "Unknown Park"

          try {
            const response = await BookingService.getBookingsByParkId(selectedPark)
            console.log("API Response for park bookings:", response)

            // Extract bookings array from the response
            console.log("ladsad data:", response)
            if (response && response.booking && Array.isArray(response.booking)) {
              allBookings = response.booking.map((booking: any) => ({
                ...booking,
                // Ensure park name is set if it's not already in the response
                park: booking.park?.name
                  ? booking.park
                  : {
                      ...booking.park,
                      name: parkName,
                    },
              }))
            }
          } catch (error) {
            console.error(`Error fetching bookings for park ${parkName}:`, error)
            toast.error(`Failed to load bookings for ${parkName}`)
          }
        } else if (userRole === "admin") {
          // Admin fetching bookings for all parks
          console.log("Fetching bookings for all parks")

          // Option 1: Fetch all bookings in one call (more efficient)
          try {
            const response = await BookingService.getAllBookings()
            console.log("API Response for all bookings:", response)

            if (response && response.data && Array.isArray(response.data)) {
              allBookings = response.data
            }
          } catch (error) {
            console.error("Error fetching all bookings:", error)
            toast.error("Failed to load bookings")
          }

          // Option 2: Fetch bookings park by park (matches your pricing pattern)
          // Uncomment this block and comment out Option 1 if you prefer this approach
          /*
          for (const park of parks) {
            try {
              const response = await getBookingsByParkId(park._id);
              console.log(`API Response for park ${park.name} bookings:`, response);

              // Extract bookings array from the response
              if (response && response.data && Array.isArray(response.data)) {
                const bookingsWithParkName = response.data.map((booking: any) => ({
                  ...booking,
                  // Ensure park name is set if it's not already in the response
                  park: booking.park?.name ? booking.park : { 
                    ...booking.park, 
                    name: park.name 
                  }
                }));
                allBookings.push(...bookingsWithParkName);
              }
            } catch (error) {
              console.error(`Error fetching bookings for park ${park.name}:`, error);
              toast.error(`Failed to load bookings for ${park.name}`);
            }
          }
          */
        }

        console.log("Final bookings data:", allBookings)
        setBookings(allBookings)
      } catch (error) {
        console.error("Error fetching booking data:", error)
        toast.error("Failed to load booking data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchBookingData()
  }, [selectedPark, parks, userRole])

  // Filter bookings based on search and status
  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = selectedStatus && selectedStatus !== "all" ? booking.status === selectedStatus : true
    const matchesQrCode = qrCodeSearch
      ? booking.TicketCode?.includes(qrCodeSearch) || booking.QrCode?.includes(qrCodeSearch)
      : true
    return matchesSearch && matchesStatus && matchesQrCode
  })

  // Handle booking cancellation
  const handleCancelClick = (bookingId: string) => {
    setBookingToCancel(bookingId)
    setCancelDialogOpen(true)
  }

  const handleCancelConfirm = async () => {
    if (!bookingToCancel) return

    try {
      await BookingService.cancelBooking(bookingToCancel)

      // Update the booking status in the local state
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking._id === bookingToCancel ? { ...booking, status: "cancelled" } : booking,
        ),
      )

      toast.success("Booking cancelled successfully")
    } catch (error) {
      console.error("Error cancelling booking:", error)
      toast.error("Failed to cancel booking")
    } finally {
      setCancelDialogOpen(false)
      setBookingToCancel(null)
    }
  }

  // Handle booking deletion (admin only)
  const handleDeleteClick = (bookingId: string) => {
    setBookingToDelete(bookingId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!bookingToDelete) return

    try {
      await BookingService.deleteBooking(bookingToDelete)

      // Remove the booking from the local state
      setBookings((prevBookings) => prevBookings.filter((booking) => booking._id !== bookingToDelete))

      toast.success("Booking deleted successfully")
    } catch (error) {
      console.error("Error deleting booking:", error)
      toast.error("Failed to delete booking")
    } finally {
      setDeleteDialogOpen(false)
      setBookingToDelete(null)
    }
  }

  const handleMarkAsUsed = (bookingId: string) => {
    setBookingToMarkAsUsed(bookingId)
    setMarkingAsUsed(true)
  }

  const confirmMarkAsUsed = async () => {
    if (!bookingToMarkAsUsed) return

    try {
      await BookingService.markBookingAsUsed(bookingToMarkAsUsed)

      // Update the booking status in the local state
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking._id === bookingToMarkAsUsed ? { ...booking, user: { ...booking.user, used: true } } : booking,
        ),
      )

      toast.success("Ticket marked as used successfully")
    } catch (error) {
      console.error("Error marking ticket as used:", error)
      toast.error("Failed to mark ticket as used")
    } finally {
      setMarkingAsUsed(false)
      setBookingToMarkAsUsed(null)
    }
  }

  // Format date for display
  const formatDate = (dateString: string, timeString?: string) => {
    const date = new Date(dateString)
    const formattedDate = date.toLocaleDateString()

    if (timeString) {
      return `${formattedDate} ${timeString}`
    }

    return formattedDate + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Render status badge
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

  // Render payment status badge
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bookings</CardTitle>
        <CardDescription>Manage your adventure park bookings</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-col gap-4 sm:flex-row">
          <Input
            placeholder="Search by customer name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="sm:max-w-xs"
          />

          <Input
            placeholder="Search by QR code..."
            value={qrCodeSearch}
            onChange={(e) => setQrCodeSearch(e.target.value)}
            className="sm:max-w-xs"
          />

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="sm:max-w-xs">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          {userRole === "admin" && parks.length > 1 && (
            <Select value={selectedPark || "all"} onValueChange={setSelectedPark}>
              <SelectTrigger className="sm:max-w-xs">
                <SelectValue placeholder="Select park" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Parks</SelectItem>
                {parks.map((park) => (
                  <SelectItem key={park._id} value={park._id}>
                    {park.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            {searchQuery || selectedStatus ? "No bookings match your search criteria" : "No bookings found"}
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Park</TableHead>
                  <TableHead>Ticket Code</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Used</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((booking) => (
                  <TableRow key={booking._id}>
                    <TableCell className="font-medium">
                      <div>{booking.user.name}</div>
                      <div className="text-xs text-muted-foreground">{booking.user.email}</div>
                    </TableCell>
                    <TableCell>{booking.park.name}</TableCell>
                    <TableCell>{booking.TicketCode}</TableCell>
                    <TableCell>
                      {booking.startTime && booking.endTime
                        ? formatDate(booking.date, `${booking.startTime} - ${booking.endTime}`)
                        : formatDate(booking.date)}
                    </TableCell>
                    <TableCell>{booking.quantity}</TableCell>
                    <TableCell>${booking.totalPrice.toFixed(2)}</TableCell>
                    <TableCell>{getPaymentStatusBadge(booking.paymentStatus)}</TableCell>
                    <TableCell>
                      {booking.used ? (
                        <Badge className="bg-blue-500">Used</Badge>
                      ) : (
                        <Badge variant="outline">Unused</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <Link href={`/dashboard/bookings/${booking._id}`}>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                          </Link>
                          {booking.status !== "cancelled" && (
                            <DropdownMenuItem onClick={() => handleCancelClick(booking._id)}>
                              <Trash className="mr-2 h-4 w-4" />
                              Cancel Booking
                            </DropdownMenuItem>
                          )}
                          {booking.status === "confirmed" && (
                            <DropdownMenuItem onClick={() => handleMarkAsUsed(booking._id)}>
                              <QrCode className="mr-2 h-4 w-4" />
                              Mark as Used
                            </DropdownMenuItem>
                          )}
                          {userRole === "admin" && (
                            <DropdownMenuItem onClick={() => handleDeleteClick(booking._id)}>
                              <Trash className="mr-2 h-4 w-4 text-destructive" />
                              <span className="text-destructive">Delete</span>
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Cancel Booking Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel this booking?</DialogTitle>
            <DialogDescription>
              This will mark the booking as cancelled. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Go Back
            </Button>
            <Button variant="destructive" onClick={handleCancelConfirm}>
              Cancel Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Booking Dialog (Admin only) */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Permanently delete this booking?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the booking and all associated data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
            <Button onClick={confirmMarkAsUsed}>Mark as Used</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
