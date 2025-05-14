"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

type Booking = {
  id: string
  customer: {
    name: string
    email: string
    image?: string
  }
  amount: number
  status: "pending" | "processing" | "success" | "failed"
  date: string
  park: string
}

export function RecentBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate fetching data from API
    const fetchData = async () => {
      setLoading(true)
      try {
        // In a real app, this would be an API call
        // For now, we'll use mock data
        setTimeout(() => {
          setBookings([
            {
              id: "B-1234",
              customer: {
                name: "Olivia Martin",
                email: "olivia.martin@email.com",
                image: "",
              },
              amount: 199,
              status: "success",
              date: "2023-04-01",
              park: "Adventure Park Paris",
            },
            {
              id: "B-1235",
              customer: {
                name: "Jackson Lee",
                email: "jackson.lee@email.com",
                image: "",
              },
              amount: 399,
              status: "processing",
              date: "2023-04-02",
              park: "Adventure Park Lyon",
            },
            {
              id: "B-1236",
              customer: {
                name: "Isabella Nguyen",
                email: "isabella.nguyen@email.com",
                image: "",
              },
              amount: 299,
              status: "success",
              date: "2023-04-03",
              park: "Adventure Park Marseille",
            },
            {
              id: "B-1237",
              customer: {
                name: "William Kim",
                email: "william.kim@email.com",
                image: "",
              },
              amount: 99,
              status: "pending",
              date: "2023-04-04",
              park: "Adventure Park Paris",
            },
            {
              id: "B-1238",
              customer: {
                name: "Sofia Davis",
                email: "sofia.davis@email.com",
                image: "",
              },
              amount: 149,
              status: "failed",
              date: "2023-04-05",
              park: "Adventure Park Lyon",
            },
          ])
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Failed to fetch bookings:", error)
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <div className="h-10 w-10 animate-pulse rounded-full bg-muted"></div>
            <div className="space-y-2">
              <div className="h-4 w-32 animate-pulse rounded bg-muted"></div>
              <div className="h-3 w-24 animate-pulse rounded bg-muted"></div>
            </div>
            <div className="ml-auto h-4 w-16 animate-pulse rounded bg-muted"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {bookings.map((booking) => (
        <div key={booking.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src={booking.customer.image} alt="Avatar" />
            <AvatarFallback>
              {booking.customer.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{booking.customer.name}</p>
            <p className="text-sm text-muted-foreground">{booking.customer.email}</p>
          </div>
          <div className="ml-auto font-medium">
            <div className="flex flex-col items-end gap-1">
              <span>€{booking.amount}</span>
              <Badge
                variant={
                  booking.status === "success"
                    ? "success"
                    : booking.status === "processing"
                      ? "outline"
                      : booking.status === "pending"
                        ? "secondary"
                        : "destructive"
                }
                className="text-xs"
              >
                {booking.status}
              </Badge>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
