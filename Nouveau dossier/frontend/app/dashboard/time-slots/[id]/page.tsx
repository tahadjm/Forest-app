"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { TimeSlotForm } from "@/components/time-slots/time-slots-form"
import { TimeSlotService } from "@/services/time-slot-service"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function EditTimeSlotPage() {
  const params = useParams()
  const id = params?.id as string
  const [timeSlot, setTimeSlot] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTimeSlot = async () => {
      if (!id) return

      setIsLoading(true)
      setError(null)

      try {
        const response = await TimeSlotService.getTimeSlotTemplateById(id)

        if (response && response.data) {
          console.log("Fetched time slot data:", response.data)
          setTimeSlot(response.data)
        } else {
          setError("Failed to load time slot data")
        }
      } catch (err: any) {
        console.error("Error fetching time slot:", err)
        setError(err.response?.data?.message || "Failed to load time slot data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTimeSlot()
  }, [id])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return <TimeSlotForm initialData={timeSlot} isEditing={true} parkId={timeSlot?.parkId} />
}
