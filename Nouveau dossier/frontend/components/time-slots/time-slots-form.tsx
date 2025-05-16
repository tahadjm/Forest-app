"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import { PricingService } from "@/services/pricing-service"
import { ParkService } from "@/services/park-service"
import { TimeSlotService } from "@/services/time-slot-service"
import { Clock, Trash, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { DatePicker } from "@/components/ui/date-picker"
import { format, addDays } from "date-fns"

interface TimeSlotFormProps {
  parkId?: string
  initialPricingIds?: string[]
  initialData?: any
  isEditing?: boolean
}

const daysOfWeek = [
  { value: "0", label: "Sunday" },
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
]

export function TimeSlotForm({
  parkId: initialParkId,
  initialPricingIds = [],
  initialData = null,
  isEditing = false,
}: TimeSlotFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [parks, setParks] = useState<any[]>([])
  const [parkPrices, setParkPrices] = useState<any[]>([])
  const [selectedDaysOfWeek, setSelectedDaysOfWeek] = useState<string[]>([])
  const [selectedParkId, setSelectedParkId] = useState<string>(initialParkId || "")
  const [selectedPricingIds, setSelectedPricingIds] = useState<string[]>(initialPricingIds)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [workingHours, setWorkingHours] = useState<Record<string, any>>({})
  const [availableTimeSlots, setAvailableTimeSlots] = useState<any[]>([])
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<any[]>([])
  const [ticketLimit, setTicketLimit] = useState<number>(20)
  const [availableTickets, setAvailableTickets] = useState<number>(20)
  const [priceAdjustment, setPriceAdjustment] = useState<number>(0)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [warnings, setWarnings] = useState<string[]>([])
  const [hasOverlappingSlots, setHasOverlappingSlots] = useState(false)
  const [validUntil, setValidUntil] = useState<Date | undefined>(undefined)
  const [formInitialized, setFormInitialized] = useState(false)

  // Initialize form with data if editing
  useEffect(() => {
    if (initialData && isEditing && !formInitialized) {
      console.log("Initializing form with data:", initialData)

      // Set park ID
      if (initialData.parkId) {
        setSelectedParkId(initialData.parkId)
      }

      // Set pricing IDs
      if (initialData.pricingIds && Array.isArray(initialData.pricingIds)) {
        setSelectedPricingIds(initialData.pricingIds)
      }

      // Set days of week
      if (initialData.daysOfWeek && Array.isArray(initialData.daysOfWeek)) {
        // Convert all numbers to strings
        const daysAsStrings = initialData.daysOfWeek.map((day: number) => String(day))
        console.log("Setting days of week:", daysAsStrings)
        setSelectedDaysOfWeek(daysAsStrings)
      }

      // Set dates
      if (initialData.validFrom) {
        try {
          const validFromDate = new Date(initialData.validFrom)
          setSelectedDate(validFromDate)
        } catch (e) {
          console.error("Invalid validFrom date:", e)
        }
      }

      if (initialData.validUntil) {
        try {
          const validUntilDate = new Date(initialData.validUntil)
          setValidUntil(validUntilDate)
        } catch (e) {
          console.error("Invalid validUntil date:", e)
        }
      }

      // Set time slots
      if (initialData.startTime && initialData.endTime) {
        setSelectedTimeSlots([
          {
            startTime: initialData.startTime,
            endTime: initialData.endTime,
            label: `${initialData.startTime} - ${initialData.endTime}`,
          },
        ])
      }

      // Set other fields
      if (initialData.ticketLimit) {
        setTicketLimit(initialData.ticketLimit)
      }

      if (initialData.availableTickets !== undefined) {
        setAvailableTickets(initialData.availableTickets)
      }

      if (initialData.priceAdjustment !== undefined) {
        setPriceAdjustment(initialData.priceAdjustment)
      }

      setFormInitialized(true)
    }
  }, [initialData, isEditing, formInitialized])

  // Fetch parks on component mount
  useEffect(() => {
    const fetchParks = async () => {
      try {
        const response = await ParkService.getParkForCurrentUser()
        if (response?.data && Array.isArray(response.data)) {
          setParks(response.data)
        } else if (response?.data) {
          setParks([response.data])
        }

        // If initialParkId is provided, set it as selected
        if (initialParkId) {
          setSelectedParkId(initialParkId)
        }
      } catch (error) {
        console.error("Error fetching parks:", error)
        toast({
          title: "Error",
          description: "Failed to load parks",
          variant: "destructive",
        })
      }
    }

    fetchParks()
  }, [initialParkId])

  // Fetch pricing options when park changes
  useEffect(() => {
    if (selectedParkId) {
      fetchParkPrices(selectedParkId)
    }
  }, [selectedParkId])

  // Fetch working hours when selected date changes
  useEffect(() => {
    if (selectedParkId && selectedDate && !isEditing) {
      fetchWorkingHoursForSelectedDate()
    } else if (!isEditing) {
      setWorkingHours({})
      setAvailableTimeSlots([])
    }
  }, [selectedParkId, selectedDate, isEditing])

  const fetchParkPrices = async (parkId: string) => {
    if (!parkId) return

    setIsLoading(true)
    try {
      const response = await PricingService.getAllPricing(parkId)
      const prices = response.pricing || []
      setParkPrices(Array.isArray(prices) ? prices : [])
    } catch (error) {
      console.error("Error fetching park prices:", error)
      toast({
        title: "Error",
        description: "Failed to load pricing data",
        variant: "destructive",
      })
      setParkPrices([])
    } finally {
      setIsLoading(false)
    }
  }

  const fetchWorkingHoursForSelectedDate = async () => {
    if (!selectedParkId || !selectedDate) return

    setIsLoading(true)
    setWarnings([])

    try {
      const formattedDate = format(selectedDate, "yyyy-MM-dd")
      const hours = await ParkService.getWorkingHours(selectedParkId, formattedDate)

      if (!hours || hours.closed) {
        setWarnings(["Park is closed on the selected date"])
        setWorkingHours({})
        setAvailableTimeSlots([])
        return
      }

      setWorkingHours(hours)
      generateTimeSlots(hours)

      // Remove the automatic day of week setting
      // We'll let the user select days manually
    } catch (error) {
      console.error("Error fetching working hours:", error)
      toast({
        title: "Error",
        description: "Failed to load working hours",
        variant: "destructive",
      })
      setWorkingHours({})
      setAvailableTimeSlots([])
    } finally {
      setIsLoading(false)
    }
  }

  const generateTimeSlots = (hours: any) => {
    if (!hours || hours.closed) {
      setAvailableTimeSlots([])
      return
    }

    const { from, to } = hours
    const [fromHours, fromMinutes] = from.split(":").map(Number)
    const [toHours, toMinutes] = to.split(":").map(Number)

    const fromMinutesTotal = fromHours * 60 + fromMinutes
    const toMinutesTotal = toHours * 60 + toMinutes

    const slots = []
    const slotDuration = 120 // 2 hours in minutes

    for (let time = fromMinutesTotal; time < toMinutesTotal; time += slotDuration) {
      const startHour = Math.floor(time / 60)
      const startMinute = time % 60

      const endTime = Math.min(time + slotDuration, toMinutesTotal)
      const endHour = Math.floor(endTime / 60)
      const endMinute = endTime % 60

      const startTimeStr = `${String(startHour).padStart(2, "0")}:${String(startMinute).padStart(2, "0")}`
      const endTimeStr = `${String(endHour).padStart(2, "0")}:${String(endMinute).padStart(2, "0")}`

      slots.push({
        startTime: startTimeStr,
        endTime: endTimeStr,
        label: `${startTimeStr} - ${endTimeStr}`,
      })
    }

    setAvailableTimeSlots(slots)
  }

  const handleParkChange = (parkId: string) => {
    setSelectedParkId(parkId)
    setSelectedPricingIds([])
    setSelectedDaysOfWeek([])
    setSelectedDate(undefined)
    setSelectedTimeSlots([])
    setWorkingHours({})
    setAvailableTimeSlots([])
    setWarnings([])
    setHasOverlappingSlots(false)
  }

  const handlePricingChange = (pricingId: string, checked: boolean) => {
    if (checked) {
      setSelectedPricingIds((prev) => [...prev, pricingId])
    } else {
      setSelectedPricingIds((prev) => prev.filter((id) => id !== pricingId))
    }

    // Reset overlap warning when pricing changes
    setHasOverlappingSlots(false)
  }

  const handleDayOfWeekChange = (day: string, checked: boolean) => {
    if (checked) {
      setSelectedDaysOfWeek((prev) => [...prev, day])
    } else {
      setSelectedDaysOfWeek((prev) => prev.filter((d) => d !== day))
    }

    // Reset overlap warning when days change
    setHasOverlappingSlots(false)
  }

  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date)
    setSelectedTimeSlots([])
    setHasOverlappingSlots(false)
    // Remove the line that clears selected days
  }

  const handleAddTimeSlot = (timeSlot: any) => {
    // Check if this time slot is already selected
    const exists = selectedTimeSlots.some(
      (slot) => slot.startTime === timeSlot.startTime && slot.endTime === timeSlot.endTime,
    )

    if (!exists) {
      setSelectedTimeSlots([...selectedTimeSlots, timeSlot])

      // Check for overlaps when a time slot is added
      checkForOverlaps(timeSlot)
    }
  }

  const checkForOverlaps = async (timeSlot: any) => {
    if (!selectedParkId || selectedPricingIds.length === 0 || !selectedDate) return

    setIsChecking(true)
    try {
      const formattedDate = format(selectedDate, "yyyy-MM-dd")
      const validFrom = formattedDate
      const validUntil = format(addDays(selectedDate, 30), "yyyy-MM-dd") // Default 30 days validity

      const hasOverlap = await TimeSlotService.checkOverlappingTemplates(
        selectedParkId,
        validFrom,
        validUntil,
        timeSlot.startTime,
        timeSlot.endTime,
        selectedDaysOfWeek.map((day) => Number.parseInt(day)),
        selectedPricingIds,
      )

      setHasOverlappingSlots(hasOverlap)
    } catch (error) {
      console.error("Error checking for overlaps:", error)
    } finally {
      setIsChecking(false)
    }
  }

  const handleRemoveTimeSlot = (index: number) => {
    const newTimeSlots = [...selectedTimeSlots]
    newTimeSlots.splice(index, 1)
    setSelectedTimeSlots(newTimeSlots)

    // Reset overlap warning when time slots change
    setHasOverlappingSlots(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    if (name === "ticketLimit") {
      setTicketLimit(Number.parseInt(value) || 0)
    } else if (name === "availableTickets") {
      setAvailableTickets(Number.parseInt(value) || 0)
    } else if (name === "priceAdjustment") {
      setPriceAdjustment(Number.parseFloat(value) || 0)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!selectedParkId) {
      newErrors.parkId = "Park is required"
    }

    if (selectedPricingIds.length === 0) {
      newErrors.pricingIds = "At least one pricing option must be selected"
    }

    if (!selectedDate) {
      newErrors.validFrom = "Start date is required"
    }

    if (selectedDaysOfWeek.length === 0) {
      newErrors.daysOfWeek = "At least one day of week must be selected"
    }

    if (selectedTimeSlots.length === 0) {
      newErrors.timeSlots = "At least one time slot must be selected"
    }

    if (ticketLimit < 1) {
      newErrors.ticketLimit = "Ticket limit must be at least 1"
    }

    if (hasOverlappingSlots && !isEditing) {
      newErrors.overlap = "One or more selected time slots overlap with existing templates"
    }

    if (warnings.length > 0 && !newErrors.warnings) {
      newErrors.warnings = "There are warnings that need to be addressed"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const checkClosedDays = async () => {
    if (!selectedParkId || !selectedDate || !validUntil || selectedDaysOfWeek.length === 0) return

    setIsLoading(true)
    const warnings: string[] = []

    try {
      // Check each selected day of week
      for (const dayStr of selectedDaysOfWeek) {
        const day = Number.parseInt(dayStr)
        // You would need to implement this function in your ParkService
        const isClosed = await ParkService.isDayClosed(selectedParkId, day)
        if (isClosed) {
          warnings.push(`The park is typically closed on ${daysOfWeek.find((d) => d.value === dayStr)?.label}s`)
        }
      }

      if (warnings.length > 0) {
        setWarnings(warnings)
      }
    } catch (error) {
      console.error("Error checking closed days:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Add an effect to check for closed days when days of week or date range changes
  useEffect(() => {
    if (selectedParkId && selectedDate && validUntil && selectedDaysOfWeek.length > 0) {
      checkClosedDays()
    }
  }, [selectedParkId, selectedDate, validUntil, selectedDaysOfWeek])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // For each time slot
      for (const timeSlot of selectedTimeSlots) {
        const timeSlotData = {
          pricingIds: selectedPricingIds,
          validFrom: selectedDate ? format(selectedDate, "yyyy-MM-dd") : undefined,
          validUntil: validUntil
            ? format(validUntil, "yyyy-MM-dd")
            : selectedDate
              ? format(addDays(selectedDate, 30), "yyyy-MM-dd")
              : undefined,
          startTime: timeSlot.startTime,
          endTime: timeSlot.endTime,
          ticketLimit: ticketLimit,
          priceAdjustment: priceAdjustment,
          daysOfWeek: selectedDaysOfWeek.map((day) => Number.parseInt(day)),
        }
        console.log("submitting data :", selectedParkId, timeSlotData)

        if (isEditing && initialData?._id) {
          // Update existing time slot
          await TimeSlotService.updateTimeSlotTemplate(initialData._id, timeSlotData)
        } else {
          // Create new time slot
          await TimeSlotService.createTimeSlotTemplate(selectedParkId, timeSlotData)
        }
      }

      toast({
        title: "Success",
        description: isEditing ? "Time slot template updated successfully" : "Time slot templates created successfully",
      })

      if (isEditing) {
        // Navigate back to time slots list after editing
        router.push("/dashboard/time-slots")
      } else {
        // Clear selected time slots but keep other selections for adding more
        setSelectedTimeSlots([])
        setHasOverlappingSlots(false)
      }
    } catch (error: any) {
      console.error("Error saving time slot template:", error)

      // Handle specific backend validation errors
      if (error.response?.data?.message) {
        toast({
          title: "Error",
          description: error.response.data.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: isEditing ? "Failed to update time slot template" : "Failed to create time slot templates",
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleFinish = () => {
    router.push("/dashboard/time-slots")
  }

  // Debug function to check if a day is selected
  const isDaySelected = (dayValue: string) => {
    return selectedDaysOfWeek.includes(dayValue)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Time Slot" : "Create Time Slots"}</CardTitle>
        <CardDescription>
          {isEditing ? "Update time slot details" : "Add time slots for park activities"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Park Selection */}
            <div>
              <Label htmlFor="parkId">Park</Label>
              <Select
                value={selectedParkId}
                onValueChange={handleParkChange}
                disabled={isLoading || !!initialParkId || isEditing}
              >
                <SelectTrigger id="parkId" className={errors.parkId ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select a park" />
                </SelectTrigger>
                <SelectContent>
                  {parks.map((park) => (
                    <SelectItem key={park._id} value={park._id}>
                      {park.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.parkId && <p className="text-sm text-red-500 mt-1">{errors.parkId}</p>}
            </div>

            {/* Date Range Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="validFrom">Valid From</Label>
                <div className={errors.validFrom ? "border-red-500 rounded-md" : ""}>
                  <DatePicker
                    selected={selectedDate}
                    onSelect={handleDateChange}
                    disabled={isLoading || isEditing}
                    className="w-full"
                  />
                </div>
                {errors.validFrom && <p className="text-sm text-red-500 mt-1">{errors.validFrom}</p>}
              </div>
              <div>
                <Label htmlFor="validUntil">Valid Until</Label>
                <div className={errors.validUntil ? "border-red-500 rounded-md" : ""}>
                  <DatePicker
                    selected={validUntil || (selectedDate ? addDays(selectedDate, 30) : undefined)}
                    onSelect={(date) => setValidUntil(date)}
                    disabled={isLoading || !selectedDate}
                    minDate={selectedDate ? addDays(selectedDate, 1) : undefined}
                    className="w-full"
                  />
                </div>
                {errors.validUntil && <p className="text-sm text-red-500 mt-1">{errors.validUntil}</p>}
                <p className="text-xs text-muted-foreground mt-1">Default is 30 days from start date</p>
              </div>
            </div>

            {/* Days of Week Selection */}
            <div>
              <Label>Days of Week</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                {daysOfWeek.map((day) => (
                  <div key={day.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`day-${day.value}`}
                      checked={isDaySelected(day.value)}
                      onCheckedChange={(checked) => handleDayOfWeekChange(day.value, checked === true)}
                      disabled={isLoading}
                    />
                    <Label htmlFor={`day-${day.value}`} className="text-sm font-normal">
                      {day.label}
                    </Label>
                  </div>
                ))}
              </div>
              {errors.daysOfWeek && <p className="text-sm text-red-500 mt-1">{errors.daysOfWeek}</p>}
              <p className="text-xs text-muted-foreground mt-1">
                Select the days of the week this time slot will be available between the start and end dates
              </p>

              {/* Debug info for days of week */}
              {isEditing && (
                <div className="mt-2 text-xs text-muted-foreground">
                  <p>Selected days: {selectedDaysOfWeek.join(", ")}</p>
                  <p>
                    Days mapped:{" "}
                    {selectedDaysOfWeek.map((day) => daysOfWeek.find((d) => d.value === day)?.label || day).join(", ")}
                  </p>
                </div>
              )}
            </div>

            {/* Working Hours Information */}
            {Object.keys(workingHours).length > 0 && (
              <Alert className="bg-primary/10 border-primary/20">
                <Clock className="h-4 w-4" />
                <AlertTitle>Working Hours</AlertTitle>
                <AlertDescription>
                  <div className="text-sm">
                    {selectedDate && (
                      <div>
                        <span className="font-medium">{format(selectedDate, "EEEE, MMMM d, yyyy")}: </span>
                        {workingHours.from} - {workingHours.to}
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Warnings about working hours */}
            {warnings.length > 0 && (
              <Alert variant="warning">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc pl-5 mt-2">
                    {warnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Pricing Selection - Multiple Checkboxes */}
            <div>
              <Label>Pricing Options (Select Multiple)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                {isLoading ? (
                  <p className="text-sm text-muted-foreground">Loading pricing options...</p>
                ) : parkPrices.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No pricing options available for this park</p>
                ) : (
                  parkPrices.map((price) => (
                    <div key={price._id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`pricing-${price._id}`}
                        checked={selectedPricingIds.includes(price._id)}
                        onCheckedChange={(checked) => handlePricingChange(price._id, checked === true)}
                        disabled={isLoading || (isEditing && initialData?.pricingIds)}
                      />
                      <Label htmlFor={`pricing-${price._id}`} className="text-sm font-normal">
                        {price.name} - ${price.price || 0}
                      </Label>
                    </div>
                  ))
                )}
              </div>
              {errors.pricingIds && <p className="text-sm text-red-500 mt-1">{errors.pricingIds}</p>}
            </div>

            {/* Ticket Limit, Available Tickets, and Price Adjustment */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="ticketLimit">Ticket Limit</Label>
                <Input
                  id="ticketLimit"
                  name="ticketLimit"
                  type="number"
                  value={ticketLimit}
                  onChange={handleInputChange}
                  min={1}
                  className={errors.ticketLimit ? "border-red-500" : ""}
                  disabled={isLoading}
                />
                {errors.ticketLimit && <p className="text-sm text-red-500 mt-1">{errors.ticketLimit}</p>}
              </div>

              <div>
                <Label htmlFor="availableTickets">Available Tickets</Label>
                <Input
                  id="availableTickets"
                  name="availableTickets"
                  type="number"
                  value={availableTickets}
                  onChange={handleInputChange}
                  min={0}
                  max={ticketLimit}
                  className={errors.availableTickets ? "border-red-500" : ""}
                  disabled={isLoading}
                />
                {errors.availableTickets && <p className="text-sm text-red-500 mt-1">{errors.availableTickets}</p>}
              </div>

              <div>
                <Label htmlFor="priceAdjustment">Price Adjustment ($)</Label>
                <Input
                  id="priceAdjustment"
                  name="priceAdjustment"
                  type="number"
                  value={priceAdjustment}
                  onChange={handleInputChange}
                  step="0.01"
                  className={errors.priceAdjustment ? "border-red-500" : ""}
                  disabled={isLoading}
                />
                {errors.priceAdjustment && <p className="text-sm text-red-500 mt-1">{errors.priceAdjustment}</p>}
                <p className="text-xs text-muted-foreground mt-1">Adjust the base price (positive or negative)</p>
              </div>
            </div>

            {/* Time Slots */}
            {selectedParkId && selectedDate && Object.keys(workingHours).length > 0 && !isEditing && (
              <div>
                <Label>Available Time Slots</Label>
                {availableTimeSlots.length === 0 ? (
                  <Alert className="mt-2">
                    <AlertDescription>No time slots available for the selected date.</AlertDescription>
                  </Alert>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
                    {availableTimeSlots.map((slot, index) => (
                      <Button
                        key={index}
                        type="button"
                        variant="outline"
                        className="justify-start"
                        onClick={() => handleAddTimeSlot(slot)}
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        {slot.label}
                      </Button>
                    ))}
                  </div>
                )}
                {errors.timeSlots && <p className="text-sm text-red-500 mt-1">{errors.timeSlots}</p>}
              </div>
            )}

            {/* Selected Time Slots */}
            {selectedTimeSlots.length > 0 && (
              <div>
                <Label>Selected Time Slots</Label>
                <div className="mt-2 space-y-2">
                  {selectedTimeSlots.map((slot, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4" />
                        {slot.label}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveTimeSlot(index)}
                        disabled={isEditing && initialData?.startTime}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Overlapping Slots Warning */}
            {hasOverlappingSlots && !isEditing && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Overlapping Time Slots</AlertTitle>
                <AlertDescription>
                  One or more of your selected time slots overlap with existing slots for the same date, pricing, and
                  days. Please select different time slots or a different date.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button
              type="submit"
              disabled={
                isLoading ||
                !selectedParkId ||
                selectedPricingIds.length === 0 ||
                !selectedDate ||
                selectedDaysOfWeek.length === 0 ||
                selectedTimeSlots.length === 0 ||
                (hasOverlappingSlots && !isEditing)
              }
              className="flex-1"
            >
              {isLoading
                ? isEditing
                  ? "Updating..."
                  : "Creating..."
                : isEditing
                  ? "Update Time Slot"
                  : "Add Selected Time Slots"}
            </Button>
            <Button type="button" variant="outline" onClick={handleFinish} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
