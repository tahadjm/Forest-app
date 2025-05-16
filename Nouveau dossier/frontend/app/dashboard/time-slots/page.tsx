import { TimeSlotsList } from "@/components/time-slots/time-slots-list"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"

export default function TimeSlotsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Time Slots</h1>
        <Link href="/dashboard/time-slots/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Time Slot
          </Button>
        </Link>
      </div>
      <TimeSlotsList />
    </div>
  )
}
