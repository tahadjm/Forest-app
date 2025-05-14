"use client"

import { Skeleton } from "@/components/ui/skeleton"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Edit, Trash, Plus, Search, Filter, Tag, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { useToast } from "@/components/ui/use-toast"
import { ParkService } from "@/services/park-service"
import PricingService from "@/services/pricing-service"
import { ProtectedComponent } from "../protectedComponent"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface PricingItem {
  _id: string
  name: string
  parkId: string
  parkName?: string
  price: number
  type: string
  description: string
  additionalCharge: number
}

interface Park {
  _id: string
  name: string
}

export function PricingList() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPark, setSelectedPark] = useState<string>("")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [pricingToDelete, setPricingToDelete] = useState<string | null>(null)
  const [pricingData, setPricingData] = useState<PricingItem[]>([])
  const [parks, setParks] = useState<Park[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")
  const [sortField, setSortField] = useState<string>("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [filtersVisible, setFiltersVisible] = useState(false)

  const { toast } = useToast()

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

  useEffect(() => {
    const fetchPricingData = async () => {
      if (parks.length === 0) return

      setIsLoading(true)
      try {
        let allPricing: PricingItem[] = []

        // If a specific park is selected
        if (selectedPark && selectedPark !== "all") {
          const parkName = parks.find((park) => park._id === selectedPark)?.name || "Unknown Park"

          try {
            const response = await PricingService.getAllPricing(selectedPark)

            // Extract pricing array from the response
            if (response && response.pricing && Array.isArray(response.pricing)) {
              allPricing = response.pricing.map((pricing: any) => ({
                ...pricing,
                parkName: parkName,
              }))
            }
          } catch (error) {
            console.error(`Error fetching pricing for park ${parkName}:`, error)
            toast({
              title: "Error",
              description: "Failed to load pricing data",
              variant: "destructive",
            })
          }
        } else {
          // Fetch pricing for all parks
          for (const park of parks) {
            try {
              const response = await PricingService.getAllPricing(park._id)

              // Extract pricing array from the response
              if (response && response.pricing && Array.isArray(response.pricing)) {
                const pricingWithParkName = response.pricing.map((pricing: any) => ({
                  ...pricing,
                  parkName: park.name,
                }))
                allPricing.push(...pricingWithParkName)
              }
            } catch (error) {
              console.error(`Error fetching pricing for park ${park.name}:`, error)
              toast({
                title: "Error",
                description: "Failed to load pricing data",
                variant: "destructive",
              })
            }
          }
        }

        setPricingData(allPricing)
      } catch (error) {
        console.error("Error fetching pricing data:", error)
        toast({
          title: "Error",
          description: "Failed to load pricing data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchPricingData()
  }, [selectedPark, parks])

  // Function to handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Filter and sort pricing data
  const filteredPricing = pricingData
    .filter((pricing) => {
      const matchesSearch = pricing.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = selectedType === "all" || pricing.type === selectedType
      return matchesSearch && matchesType
    })
    .sort((a, b) => {
      let comparison = 0

      if (sortField === "name") {
        comparison = a.name.localeCompare(b.name)
      } else if (sortField === "type") {
        comparison = a.type.localeCompare(b.type)
      } else if (sortField === "price") {
        comparison = a.price - b.price
      } else if (sortField === "additionalCharge") {
        comparison = a.additionalCharge - b.additionalCharge
      }

      return sortDirection === "asc" ? comparison : -comparison
    })

  const handleDeleteClick = (pricingId: string) => {
    setPricingToDelete(pricingId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!pricingToDelete) return

    try {
      // Find the pricing item to get its parkId
      const pricingItem = pricingData.find((item) => item._id === pricingToDelete)
      if (!pricingItem) {
        throw new Error("Pricing item not found")
      }

      await PricingService.deleteProduct(pricingItem.parkId, pricingToDelete)
      setPricingData(pricingData.filter((pricing) => pricing._id !== pricingToDelete))
      toast({
        title: "Success",
        description: "Pricing deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting pricing:", error)
      toast({
        title: "Error",
        description: "Failed to delete pricing",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setPricingToDelete(null)
    }
  }

  // Get pricing type badge color
  const getPricingTypeColor = (type: string): string => {
    console.log(type)
    if (!type) return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    switch (type.toLowerCase()) {
      case "adult":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      case "child":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case "family":
        return "bg-purple-100 text-purple-800 hover:bg-purple-200"
      case "group":
        return "bg-orange-100 text-orange-800 hover:bg-orange-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  return (
    <TooltipProvider>
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Pricing</CardTitle>
            <CardDescription>Manage your adventure park pricing</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Tooltip content="Grid view">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
                className="h-9 w-9"
              >
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
                >
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                </svg>
                <span className="sr-only">Grid view</span>
              </Button>
            </Tooltip>

            <Tooltip content="Table view">
              <Button
                variant={viewMode === "table" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("table")}
                className="h-9 w-9"
              >
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
                >
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
                <span className="sr-only">Table view</span>
              </Button>
            </Tooltip>

            <Link href="/dashboard/pricing/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Pricing
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search pricing..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex gap-2">
                <ProtectedComponent>
                  <Select value={selectedPark} onValueChange={setSelectedPark}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by park" />
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
                </ProtectedComponent>

                <Button variant="outline" onClick={() => setFiltersVisible(!filtersVisible)}>
                  <Filter className="h-4 w-4 mr-2" />
                  {filtersVisible ? "Hide Filters" : "More Filters"}
                </Button>
              </div>
            </div>

            {filtersVisible && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                <div>
                  <label className="text-sm font-medium mb-1 block">Pricing Type</label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      <SelectItem value="adult">Adult</SelectItem>
                      <SelectItem value="child">Child</SelectItem>
                      <SelectItem value="family">Family</SelectItem>
                      <SelectItem value="group">Group</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Price Range</label>
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue placeholder="All prices" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All prices</SelectItem>
                      <SelectItem value="low">Under $25</SelectItem>
                      <SelectItem value="medium">$25 - $50</SelectItem>
                      <SelectItem value="high">Over $50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Sort By</label>
                  <Select
                    value={`${sortField}-${sortDirection}`}
                    onValueChange={(value) => {
                      const [field, direction] = value.split("-")
                      setSortField(field)
                      setSortDirection(direction as "asc" | "desc")
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                      <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                      <SelectItem value="price-asc">Price (Low to High)</SelectItem>
                      <SelectItem value="price-desc">Price (High to Low)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <Skeleton key={index} className="h-24 w-full" />
              ))}
            </div>
          ) : filteredPricing.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              {searchQuery ? "No pricing data match your search" : "No pricing data available"}
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPricing.map((pricing) => (
                <Card key={pricing._id} className="overflow-hidden border hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    <div className="h-24 bg-muted/50 flex items-center justify-center">
                      <Tag className="h-12 w-12 text-muted-foreground/50" />
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold">{pricing.name}</h3>
                        <Badge className={cn("font-normal", getPricingTypeColor(pricing.type))}>{pricing.type}</Badge>
                      </div>

                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl font-bold">${pricing.price.toFixed(2)}</span>
                        {pricing.additionalCharge > 0 && (
                          <Badge variant="outline" className="font-normal">
                            +${pricing.additionalCharge.toFixed(2)} extra
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {pricing.description || "No description available"}
                      </p>

                      <div className="mt-2 text-xs text-muted-foreground">Park: {pricing.parkName}</div>
                    </div>
                  </CardContent>
                  <div className="flex justify-between p-4 pt-0 mt-4">
                    <Link href={`/dashboard/pricing/${pricing._id}?parkId=${pricing.parkId}`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </Link>
                    <ProtectedComponent>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                            <Trash className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" forceMount>
                          <DropdownMenuItem onClick={() => handleDeleteClick(pricing._id)}>
                            Confirm Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </ProtectedComponent>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("name")}>
                      <div className="flex items-center">
                        Name
                        {sortField === "name" && (
                          <ArrowUpDown className={cn("ml-2 h-4 w-4", sortDirection === "desc" && "rotate-180")} />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Park</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("type")}>
                      <div className="flex items-center">
                        Type
                        {sortField === "type" && (
                          <ArrowUpDown className={cn("ml-2 h-4 w-4", sortDirection === "desc" && "rotate-180")} />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("price")}>
                      <div className="flex items-center">
                        Price
                        {sortField === "price" && (
                          <ArrowUpDown className={cn("ml-2 h-4 w-4", sortDirection === "desc" && "rotate-180")} />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("additionalCharge")}>
                      <div className="flex items-center">
                        Additional Charge
                        {sortField === "additionalCharge" && (
                          <ArrowUpDown className={cn("ml-2 h-4 w-4", sortDirection === "desc" && "rotate-180")} />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPricing.map((pricing) => (
                    <TableRow key={pricing._id}>
                      <TableCell className="font-medium">{pricing.name}</TableCell>
                      <TableCell>{pricing.parkName}</TableCell>
                      <TableCell>
                        <Badge className={cn("font-normal", getPricingTypeColor(pricing.type))}>{pricing.type}</Badge>
                      </TableCell>
                      <TableCell>${pricing.price.toFixed(2)}</TableCell>
                      <TableCell>${pricing.additionalCharge.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/dashboard/pricing/${pricing._id}?parkId=${pricing.parkId}`}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                          </Link>
                          <ProtectedComponent>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                  <Trash className="h-4 w-4 mr-2" />
                                  Delete
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" forceMount>
                                <DropdownMenuItem onClick={() => handleDeleteClick(pricing._id)}>
                                  Confirm Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
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
              <DialogTitle>Are you sure you want to delete this pricing?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete the pricing and may affect associated
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
    </TooltipProvider>
  )
}
