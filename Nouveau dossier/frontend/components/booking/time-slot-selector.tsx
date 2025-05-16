"use client"

// Update the component to fetch and display time slot instances
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Clock, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TimeSlotService } from "@/services/time-slot-service"
import { format } from "date-fns"
import type { TimeSlotInstance } from "@/types/timeSlot"

interface TimeSlotSelectorProps {
  parkId: string
  date: Date | undefined
  pricingId?: string
  selectedTime: string | null
  onSelect: (
    time: string,
    instanceId: string,
    priceAdjustment: number,
    availableTickets: number,
    startTime: string,
    endTime: string,
  ) => void
}

export default function TimeSlotSelector({ parkId, date, pricingId, selectedTime, onSelect }: TimeSlotSelectorProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [timeSlots, setTimeSlots] = useState<TimeSlotInstance[]>([])

  useEffect(() => {
    if (!parkId || !date) return

    const fetchTimeSlots = async () => {
      setLoading(true)
      setError(null)
      try {
        const formattedDate = format(date, "yyyy-MM-dd")
        const response = await TimeSlotService.getTimeSlotInstances(parkId, formattedDate, pricingId)

        if (response && Array.isArray(response.instances)) {
          setTimeSlots(response.instances)
        } else if (response && Array.isArray(response)) {
          setTimeSlots(response)
        } else if (response && response.data && Array.isArray(response.data)) {
          setTimeSlots(response.data)
        } else {
          setTimeSlots([])
        }
      } catch (err) {
        console.error("Error fetching time slots:", err)
        setError("Failed to load available time slots")
        setTimeSlots([])
      } finally {
        setLoading(false)
      }
    }

    fetchTimeSlots()
  }, [parkId, date, pricingId])

  const formatTimeSlot = (slot: TimeSlotInstance) => {
    return `${slot.templateId.startTime} - ${slot.templateId.endTime}`
  }

  const handleSelectTimeSlot = (slot: TimeSlotInstance) => {
    const timeLabel = formatTimeSlot(slot)
    onSelect(
      timeLabel,
      slot._id,
      slot.templateId.priceAdjustment,
      slot.availableTickets,
      slot.templateId.startTime,
      slot.templateId.endTime,
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-adventure-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (timeSlots.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>No time slots available for this date</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {timeSlots.map((slot) => {
        const timeLabel = formatTimeSlot(slot)
        const isSelected = selectedTime === timeLabel
        const isAvailable = slot.availableTickets > 0
        const availabilityText = isAvailable ? `${slot.availableTickets}/${slot.ticketLimit} places` : "Complet"

        return (
          <Button
            key={slot._id}
            variant={isSelected ? "default" : "outline"}
            className={`flex flex-col items-center justify-center h-auto py-2 ${
              isSelected ? "bg-adventure-500 hover:bg-adventure-600" : ""
            } ${!isAvailable ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={() => isAvailable && handleSelectTimeSlot(slot)}
            disabled={!isAvailable}
          >
            <Clock className={`h-4 w-4 mb-1 ${isSelected ? "text-white" : "text-adventure-600"}`} />
            <span className={`text-sm ${isSelected ? "text-white" : ""}`}>{timeLabel}</span>
            <span className={`text-xs ${isSelected ? "text-white/80" : "text-muted-foreground"}`}>
              {availabilityText}
            </span>
            {slot.templateId.priceAdjustment !== 0 && (
              <span
                className={`text-xs font-medium mt-1 ${
                  isSelected ? "text-white/90" : slot.templateId.priceAdjustment > 0 ? "text-green-600" : "text-red-500"
                }`}
              >
                {slot.templateId.priceAdjustment > 0 ? "+" : ""}
                {slot.templateId.priceAdjustment} DZD
              </span>
            )}
          </Button>
        )
      })}
    </div>
  )
}
