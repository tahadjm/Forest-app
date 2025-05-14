"use client"

import { useState, useEffect } from "react"
import { TimeSlotService } from "@/services/time-slot-service"

interface TimeSlot {
  _id: string
  startTime: string
  endTime: string
  priceAdjustment: number
  availableTickets: number
}

export function useTimeSlots(parkId: string, date?: Date, pricingId?: string) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!parkId) return

    const fetchTimeSlots = async () => {
      setLoading(true)
      setError(null)
      try {
        const dayOfWeek = date ? date.getDay() : undefined
        const res = await TimeSlotService.getTimeSlotsByDayAndPricing(parkId, dayOfWeek, pricingId)

        // Filter out time slots that have already passed for today
        let filteredSlots = res

        if (date && isToday(date)) {
          const now = new Date()
          const currentHour = now.getHours()
          const currentMinute = now.getMinutes()

          filteredSlots = res.filter((slot) => {
            const [hour, minute] = slot.startTime.split(":").map(Number)
            return hour > currentHour || (hour === currentHour && minute > currentMinute)
          })
        }

        setTimeSlots(filteredSlots)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch time slots")
        setTimeSlots([])
      } finally {
        setLoading(false)
      }
    }

    fetchTimeSlots()
  }, [parkId, date, pricingId])

  // Helper function to check if a date is today
  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  return { timeSlots, loading, error }
}
