"use client"

import { useEffect, useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { getCurrentUser } from "@/services/authService"
import { getParkForCurrentUser } from "@/services/parkService"

interface ParkSelectProps {
  value: string
  onValueChange: (value: string) => void
  disabled?: boolean
}

export function ParkSelect({ value, onValueChange, disabled }: ParkSelectProps) {
  const [open, setOpen] = useState(false)
  const [parks, setParks] = useState<{ id: string; name: string }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [canSelectPark, setCanSelectPark] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)

        // Check if user is admin or park manager
        const userResponse = await getCurrentUser()
        const isAdmin = userResponse.success && userResponse.data?.role === "admin"

        // If admin, they can select parks, otherwise they're restricted to their assigned park
        setCanSelectPark(isAdmin)

        // Load parks based on user role
        const parksResponse = await getParkForCurrentUser()

        if (parksResponse.success && Array.isArray(parksResponse.data)) {
          setParks(
            parksResponse.data.map((park) => ({
              id: park.id,
              name: park.name,
            })),
          )

          // If only one park and user is not admin, auto-select it
          if (parksResponse.data.length === 1 && !isAdmin) {
            onValueChange(parksResponse.data[0].id)
          }
        }
      } catch (error) {
        console.error("Error loading parks:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [onValueChange])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled || isLoading || !canSelectPark}
        >
          {isLoading ? (
            <span className="animate-pulse">Loading parks...</span>
          ) : value ? (
            parks.find((park) => park.id === value)?.name || "Select a park"
          ) : (
            "Select a park"
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search parks..." />
          <CommandList>
            <CommandEmpty>No parks found.</CommandEmpty>
            <CommandGroup>
              {parks.map((park) => (
                <CommandItem
                  key={park.id}
                  value={park.id}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? "" : currentValue)
                    setOpen(false)
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === park.id ? "opacity-100" : "opacity-0")} />
                  {park.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
