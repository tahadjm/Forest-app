import { BookingsList } from "@/components/bookings/bookings-list"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"

export default function BookingsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
        <Link href="/dashboard/bookings/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Booking
          </Button>
        </Link>
      </div>
      <BookingsList />
    </div>
  )
}
