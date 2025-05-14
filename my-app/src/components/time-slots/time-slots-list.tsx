"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Edit, MoreHorizontal, Trash, Calendar, Clock, Filter, Search, CalendarDays } from "lucide-react"
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
import { toast } from "@/components/ui/use-toast"
import { ParkService } from "@/services/park-service"
import { TimeSlotService } from "@/services/time-slot-service"
import PricingService from "@/services/pricing-service"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DatePicker } from "@/components/ui/date-picker"
import { format } from "date-fns"
import type { TimeSlotTemplate } from "@/types/timeSlot"

const daysOfWeek = [
  { value: "0", label: "Sunday" },
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
]

interface Park {
  _id: string
  name: string
}

export function TimeSlotsList() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPark, setSelectedPark] = useState<string>("")
  const [selectedPricing, setSelectedPricing] = useState<string>("")
  const [selectedDay, setSelectedDay] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [timeSlotToDelete, setTimeSlotToDelete] = useState<string | null>(null)
  const [timeSlots, setTimeSlots] = useState<TimeSlotTemplate[]>([])
  const [parks, setParks] = useState<Park[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [parkPrices, setParkPrices] = useState<any[]>([])
  const [filtersVisible, setFiltersVisible] = useState(false)

  // Fetch parks on component mount
  useEffect(() => {
    const fetchParks = async () => {
      try {
        const response = await ParkService.getParkForCurrentUser()
        if (response?.data && Array.isArray(response.data)) {
          setParks(
            response.data.map((park: any) => ({
              _id: park._id,
              name: park.name,
            })),
          )
        } else if (response.data) {
          setParks([
            {
              _id: response.data._id,
              name: response.data.name,
            },
          ])
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
  }, [])

  // Fetch time slots when park changes
  useEffect(() => {
    if (selectedPark) {
      fetchParkPrices(selectedPark)
      fetchTimeSlots()
    }
  }, [selectedPark])

  // Fetch time slots when pricing, day, or date changes
  useEffect(() => {
    if (selectedPark) {
      fetchTimeSlots()
    }
  }, [selectedPricing, selectedDay, selectedDate])

  const fetchTimeSlots = async () => {
    if (!selectedPark || selectedPark === "all") return

    setIsLoading(true)
    try {
      // Prepare query parameters
      const params: Record<string, string> = {}
      if (selectedDate) {
        params.date = format(selectedDate, "yyyy-MM-dd")
      }
      if (selectedPricing) {
        params.pricingId = selectedPricing
      }
      if (selectedDay) {
        params.dayOfWeek = selectedDay
      }

      // First, ensure we have pricing data
      if (parkPrices.length === 0) {
        await fetchParkPrices(selectedPark)
      }

      // Get time slot templates
      const response = await TimeSlotService.getTimeSlotTemplates(selectedPark, params)
      const parkName = parks.find((park) => park._id === selectedPark)?.name || "Unknown Park"

      let templates: TimeSlotTemplate[] = []

      // Handle different response formats
      if (response && Array.isArray(response)) {
        templates = response
      } else if (response && response.data && Array.isArray(response.data)) {
        templates = response.data
      } else if (response && response.templates && Array.isArray(response.templates)) {
        templates = response.templates
      } else {
        // If we can't determine the format, set empty array
        templates = []
      }

      // Map templates with pricing names
      const formattedTemplates = templates.map((template) => {
        let pricingNames: string[] = []

        if (template.pricingIds && Array.isArray(template.pricingIds)) {
          // For each pricing ID, find the corresponding pricing name
          pricingNames = template.pricingIds.map((id) => {
            // Convert to string if it's an object with _id property
            const pricingId = typeof id === "object" && id._id ? id._id : id

            // Find the pricing in our parkPrices array
            const pricing = parkPrices.find((p) => p._id === pricingId)

            // If we found it, return the name, otherwise try to get it from the populated data
            if (pricing) {
              return pricing.name
            } else if (typeof id === "object" && id.name) {
              return id.name
            } else {
              return "Unknown"
            }
          })
        }

        return {
          ...template,
          parkName,
          pricingNames,
          daysOfWeek: Array.isArray(template.daysOfWeek) ? template.daysOfWeek : [],
        }
      })

      setTimeSlots(formattedTemplates)
    } catch (error: any) {
      console.error("Error fetching time slot templates:", error)

      // Handle specific error cases
      if (error.response) {
        if (error.response.status === 404) {
          // 404 is often expected when no data exists yet
          setTimeSlots([])
          // Don't show error toast for 404
          console.log("No time slots found for the selected criteria")
          return
        } else if (error.response.status === 401 || error.response.status === 403) {
          toast({
            title: "Authentication Error",
            description: "You don't have permission to access these time slots",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Server Error",
            description: `Failed to load time slots: ${error.response.status} ${error.response.statusText || ""}`,
            variant: "destructive",
          })
        }
      } else if (error.request) {
        // Request was made but no response received
        toast({
          title: "Network Error",
          description: "Could not connect to the server. Please check your internet connection.",
          variant: "destructive",
        })
      } else {
        // Something else caused the error
        toast({
          title: "Error",
          description: error.message || "Failed to load time slot templates",
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const fetchParkPrices = async (parkId: string) => {
    if (!parkId || parkId === "all") {
      setParkPrices([])
      return
    }

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
    }
  }

  const handleParkChange = (parkId: string) => {
    setSelectedPark(parkId)
    setSelectedPricing("")
    setSelectedDay("")
    setSelectedDate(undefined)
  }

  const handlePricingChange = (pricingId: string) => {
    setSelectedPricing(pricingId)
  }

  const handleDayChange = (day: string) => {
    setSelectedDay(day)
  }

  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date)
  }

  const filteredTimeSlots = timeSlots.filter((timeSlot) => {
    const matchesSearch =
      timeSlot.parkName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      timeSlot.startTime?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      timeSlot.endTime?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (timeSlot.validFrom && new Date(timeSlot.validFrom).toLocaleDateString().includes(searchQuery)) ||
      (timeSlot.validUntil && new Date(timeSlot.validUntil).toLocaleDateString().includes(searchQuery)) ||
      (timeSlot.pricingNames &&
        timeSlot.pricingNames.some((name) => name.toLowerCase().includes(searchQuery.toLowerCase())))
    return matchesSearch
  })

  const handleDeleteClick = (templateId: string) => {
    setTimeSlotToDelete(templateId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!timeSlotToDelete) return

    try {
      await TimeSlotService.deleteTimeSlotTemplate(timeSlotToDelete)
      setTimeSlots(timeSlots.filter((template) => template._id !== timeSlotToDelete))
      toast({
        title: "Success",
        description: "Time slot template deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting time slot template:", error)
      toast({
        title: "Error",
        description: "Failed to delete time slot template",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setTimeSlotToDelete(null)
    }
  }

  const formatDaysOfWeek = (days: number[]) => {
    if (!Array.isArray(days) || days.length === 0) return "None"

    return days
      .map((day) => {
        const dayObj = daysOfWeek.find((d) => Number.parseInt(d.value) === day)
        return dayObj ? dayObj.label : day
      })
      .join(", ")
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy")
    } catch (error) {
      return dateString
    }
  }

  const toggleFilters = () => {
    setFiltersVisible(!filtersVisible)
  }

  const resetFilters = () => {
    setSelectedPricing("")
    setSelectedDay("")
    setSelectedDate(undefined)
    if (selectedPark) {
      fetchTimeSlots()
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Time Slots</CardTitle>
            <CardDescription>Manage your adventure park time slots</CardDescription>
          </div>
          <Link href="/dashboard/time-slots/new">
            <Button>
              <Calendar className="mr-2 h-4 w-4" />
              Add New Time Slot
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Input
                placeholder="Search time slots..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            </div>
            <Button variant="outline" onClick={toggleFilters} className="sm:w-auto">
              <Filter className="mr-2 h-4 w-4" />
              {filtersVisible ? "Hide Filters" : "Show Filters"}
            </Button>
          </div>

          {filtersVisible && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <label className="text-sm font-medium mb-1 block">Park</label>
                <Select value={selectedPark} onValueChange={handleParkChange}>
                  <SelectTrigger>
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
              </div>

              {selectedPark && selectedPark !== "all" && (
                <>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Date</label>
                    <DatePicker selected={selectedDate} onSelect={handleDateChange} className="w-full" />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Pricing</label>
                    <Select value={selectedPricing} onValueChange={handlePricingChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select pricing" />
                      </SelectTrigger>
                      <SelectContent>
                        {parkPrices.length === 0 ? (
                          <SelectItem value="none" disabled>
                            No pricing options available
                          </SelectItem>
                        ) : (
                          parkPrices.map((price) => (
                            <SelectItem key={price._id} value={price._id}>
                              {price.name} - ${price.price || 0}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Day</label>
                    <Select value={selectedDay} onValueChange={handleDayChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                      <SelectContent>
                        {daysOfWeek.map((day) => (
                          <SelectItem key={day.value} value={day.value}>
                            {day.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {(selectedPricing || selectedDay || selectedDate) && (
                <div className="md:col-span-4 flex justify-end">
                  <Button variant="outline" size="sm" onClick={resetFilters}>
                    Reset Filters
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : filteredTimeSlots.length === 0 ? (
          <Alert>
            <AlertDescription className="flex flex-col items-center justify-center p-6 text-center">
              <Clock className="h-10 w-10 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No time slots found</h3>
              <p className="text-muted-foreground mb-4">
                {selectedPark
                  ? "No time slots match your current filters. Try adjusting your search or create a new time slot."
                  : "Please select a park to view time slots or create a new one."}
              </p>
              <Link href="/dashboard/time-slots/new">
                <Button>
                  <Calendar className="mr-2 h-4 w-4" />
                  Create New Time Slot
                </Button>
              </Link>
            </AlertDescription>
          </Alert>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Park</TableHead>
                  <TableHead>Valid Period</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Pricing Options</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Price Adj.</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTimeSlots.map((template) => (
                  <TableRow key={template._id}>
                    <TableCell className="font-medium">{template.parkName}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>
                          {formatDate(template.validFrom)} - {formatDate(template.validUntil)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>
                          {template.startTime} - {template.endTime}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {template.pricingNames && template.pricingNames.length > 0 ? (
                          template.pricingNames.map((name, idx) => (
                            <Badge key={idx} variant="outline" className="whitespace-nowrap">
                              {name}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground">None</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px] truncate" title={formatDaysOfWeek(template.daysOfWeek)}>
                        {formatDaysOfWeek(template.daysOfWeek)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {template.priceAdjustment > 0 ? (
                        <Badge variant="default" className="bg-green-500">
                          +${template.priceAdjustment}
                        </Badge>
                      ) : template.priceAdjustment < 0 ? (
                        <Badge variant="destructive">${template.priceAdjustment}</Badge>
                      ) : (
                        <span className="text-muted-foreground">$0</span>
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
                          <Link href={`/dashboard/time-slots/${template._id}?parkId=${template.parkId}`}>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuItem onClick={() => handleDeleteClick(template._id)}>
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
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

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to delete this time slot?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the time slot and may affect associated
              bookings.
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
    </Card>
  )
}
