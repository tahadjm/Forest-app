"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Edit, Trash, Plus, Search, MapPin, Clock, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import toast from "react-hot-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
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
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { ParkService } from "@/services/park-service"
import { AuthService } from "@/services/auth-service"
import { ProtectedComponent } from "../protectedComponent"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Define the Park type
interface Park {
  id: string
  name: string
  location: string
  workingHours: any
  maxBookingDays: number
}

// Working hours display component
function WorkingHoursDisplay({ workingHours }: { workingHours: any }) {
  // If it's a string, just return it
  if (typeof workingHours === "string") {
    return <span>{workingHours}</span>
  }

  // If it's an empty object or undefined/null
  if (!workingHours || Object.keys(workingHours).length === 0) {
    return <span className="text-muted-foreground">Not specified</span>
  }

  // Format the working hours object
  return (
    <div className="space-y-1 text-sm">
      {Object.entries(workingHours).map(([day, hours]) => {
        // Handle the case where hours is an object with from/to/closed properties
        if (typeof hours === "object" && hours !== null) {
          const hoursObj = hours as any

          if (hoursObj.closed) {
            return (
              <div key={day} className="flex items-center gap-2">
                <span className="font-medium capitalize">{day}:</span>
                <span className="text-muted-foreground">Closed</span>
              </div>
            )
          }

          return (
            <div key={day} className="flex items-center gap-2">
              <span className="font-medium capitalize">{day}:</span>
              <span>
                {hoursObj.from} - {hoursObj.to}
              </span>
            </div>
          )
        }

        // Fallback for simple string values
        return (
          <div key={day} className="flex items-center gap-2">
            <span className="font-medium capitalize">{day}:</span>
            <span>{String(hours)}</span>
          </div>
        )
      })}
    </div>
  )
}

export function ParksList() {
  const [parks, setParks] = useState<Park[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [parkToDelete, setParkToDelete] = useState<string | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")

  useEffect(() => {
    const fetchParks = async () => {
      try {
        const response = await ParkService.getParkForCurrentUser()
        const role = await AuthService.getUserRole()
        setRole(role)

        if (response?.data && Array.isArray(response.data)) {
          setParks(
            response.data.map((park) => ({
              id: park._id,
              name: park.name,
              location: park.location,
              workingHours: park.workingHours || {},
              maxBookingDays: park.maxBookingDays || 0,
            })),
          )
        } else if (response?.data) {
          setParks([
            {
              id: response.data._id,
              name: response.data.name,
              location: response.data.location,
              workingHours: response.data.workingHours || {},
              maxBookingDays: response.data.maxBookingDays || 0,
            },
          ])
        } else {
          setParks([])
        }
      } catch (err) {
        setError(err.message || "Failed to fetch parks")
      } finally {
        setLoading(false)
      }
    }
    fetchParks()
  }, [])

  const filteredParks = parks.filter((park) => park.name.toLowerCase().includes(searchQuery.toLowerCase()))

  // Function to handle the delete button click
  const handleDeleteClick = (parkId: string) => {
    setParkToDelete(parkId)
    setDeleteDialogOpen(true)
  }

  // Function to confirm deletion, calls the deletePark service function
  const handleDeleteConfirm = async () => {
    if (!parkToDelete) return

    try {
      // Call the deletePark function from the service
      const result = await ParkService.deletePark(parkToDelete)
      toast.success("Park deleted successfully!")
      // Update the parks state to remove the deleted park
      setParks((prev) => prev.filter((park) => park.id !== parkToDelete))
    } catch (error) {
      console.error("Error deleting park:", error)
      toast.error("Failed to delete park")
    } finally {
      setDeleteDialogOpen(false)
      setParkToDelete(null)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Parks</CardTitle>
          <CardDescription>Manage your adventure parks</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-[300px]" />
          {[...Array(5)].map((_, index) => (
            <Skeleton key={index} className="h-16 w-full mt-4" />
          ))}
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Parks</CardTitle>
          <CardDescription>Manage your adventure parks</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}. Please try again later or contact support.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <CardTitle>Parks</CardTitle>
          <CardDescription>Manage your adventure parks</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <span>View</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setViewMode("grid")} className={viewMode === "grid" ? "bg-muted" : ""}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2 h-4 w-4"
                >
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                </svg>
                Grid view
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setViewMode("table")} className={viewMode === "table" ? "bg-muted" : ""}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2 h-4 w-4"
                >
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
                Table view
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ProtectedComponent>
            <Link href="/dashboard/parks/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Park
              </Button>
            </Link>
          </ProtectedComponent>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search parks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 max-w-md"
            />
          </div>
        </div>

        {filteredParks.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            {searchQuery ? "No parks match your search" : "No parks available"}
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredParks.map((park) => (
              <Card key={park.id} className="overflow-hidden border hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className="h-32 bg-muted/50 flex items-center justify-center">
                    <MapPin className="h-12 w-12 text-muted-foreground/50" />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2">{park.name}</h3>
                    <div className="flex items-start gap-2 text-sm text-muted-foreground mb-2">
                      <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>{park.location}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-muted-foreground mb-2">
                      <Calendar className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>Max booking: {park.maxBookingDays} days</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <div className="truncate">
                        {typeof park.workingHours === "object" && Object.keys(park.workingHours).length > 0
                          ? `${Object.keys(park.workingHours).length} days configured`
                          : "No working hours set"}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between p-4 pt-0 mt-4">
                  <Link href={`/dashboard/parks/${park.id}`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                  <ProtectedComponent>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDeleteClick(park.id)}
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </ProtectedComponent>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Working Hours</TableHead>
                  <TableHead>Max Booking Days</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParks.map((park) => (
                  <TableRow key={park.id}>
                    <TableCell className="font-medium">{park.name}</TableCell>
                    <TableCell>{park.location}</TableCell>
                    <TableCell>
                      <WorkingHoursDisplay workingHours={park.workingHours} />
                    </TableCell>
                    <TableCell>{park.maxBookingDays}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/dashboard/parks/${park.id}`}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </Link>
                        <ProtectedComponent>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteClick(park.id)}
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </ProtectedComponent>
                      </div>
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
            <DialogTitle>Are you sure you want to delete this park?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the park and all associated data.
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
