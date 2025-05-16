"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  User,
  LogOut,
  Settings,
  Calendar,
  Menu,
  X,
  ShoppingCart,
  ChevronDown,
  Compass,
  Trees,
  MapPin,
} from "lucide-react"
import { toast } from "react-hot-toast"
import { useAuthModal } from "@/hooks/use-auth-modal"
import { useAuth } from "@/context/auth-context"
import { useCartStore, useCartUI } from "@/store/cart-store"
import { ParkService } from "@/services/park-service"
import { ActivityService } from "@/services/activity-service"
import type { Park } from "@/types/Park"
import type { Activity } from "@/types/activity"

export function MainNav() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const authModal = useAuthModal()
  const [mounted, setMounted] = useState(false)
  const [cartUpdated, setCartUpdated] = useState(0)
  const { totalItems } = useCartStore()
  const { setIsOpen: setCartOpen } = useCartUI()

  // For dropdown navigation
  const [parks, setParks] = useState<Park[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState({
    parks: false,
    activities: false,
  })

  // This ensures hydration mismatch is avoided
  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch parks and activities for dropdown menus
  useEffect(() => {
    const fetchParksAndActivities = async () => {
      // Fetch parks
      try {
        setLoading((prev) => ({ ...prev, parks: true }))
        const parksResponse = await ParkService.getAllParks()
        if (parksResponse?.data && Array.isArray(parksResponse.data)) {
          setParks(parksResponse.data)
        }
      } catch (error) {
        console.error("Error fetching parks:", error)
      } finally {
        setLoading((prev) => ({ ...prev, parks: false }))
      }

      // Fetch activities
      try {
        setLoading((prev) => ({ ...prev, activities: true }))
        const activitiesResponse = await ActivityService.getAllActivities()
        console.log(activitiesResponse)
        if (activitiesResponse?.data && Array.isArray(activitiesResponse.data)) {
          // Sort activities by park name
          const sortedActivities = [...activitiesResponse.data].sort((a, b) => {
            const parkNameA = a.park?.name || ""
            const parkNameB = b.park?.name || ""
            return parkNameA.localeCompare(parkNameB)
          })
          setActivities(sortedActivities)
        }
      } catch (error) {
        console.error("Error fetching activities:", error)
      } finally {
        setLoading((prev) => ({ ...prev, activities: false }))
      }
    }

    fetchParksAndActivities()
  }, [])

  const handleSignOut = async () => {
    try {
      logout()
      toast.success("Logged out successfully")
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
      toast.error("Failed to log out")
    }
  }

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const closeMenu = () => {
    setIsOpen(false)
  }

  const handleAuthClick = (view: "login" | "signup") => {
    authModal.onOpen(view)
    closeMenu()
  }

  // Handle cart item removal to trigger updates
  const handleCartItemRemoved = () => {
    setCartUpdated((prev) => prev + 1)
  }

  // Don't render auth-dependent UI until after hydration
  if (!mounted) {
    return null
  }

  const handleCartClick = () => {
    console.log("Opening cart from header")
    setCartOpen(true)
  }

  const navigateToActivity = (parkId: string, activityId: string) => {
    router.push(`/park/${parkId}/activity?activityId=${activityId}`)
    closeMenu()
  }
  const getParkName = async (parkId: string) => {
    try {
      const park = await ParkService.getParkById(parkId)
      if (!park) {
        throw new Error("Park not found")
      }
      return park.data.name
    } catch (error) {
      console.error("Error fetching park name:", error)
      return "Unknown Park"
    }
  }
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold">Adventure Park</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Home
            </Link>

            {/* Parks Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={`text-sm font-medium transition-colors hover:text-primary flex items-center ${
                    pathname?.startsWith("/park") ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  Parks <ChevronDown className="ml-1 h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuSeparator />
                {loading.parks ? (
                  <DropdownMenuItem disabled>Loading parks...</DropdownMenuItem>
                ) : parks.length > 0 ? (
                  parks.map((park) => (
                    <Link key={park._id} href={`/park/${park._id}`} onClick={closeMenu}>
                      <DropdownMenuItem>
                        <MapPin className="mr-2 h-4 w-4" />
                        <span>{park.name}</span>
                      </DropdownMenuItem>
                    </Link>
                  ))
                ) : (
                  <DropdownMenuItem disabled>No parks available</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Activities Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={`text-sm font-medium transition-colors hover:text-primary flex items-center ${
                    pathname === "/activities" ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  Activities <ChevronDown className="ml-1 h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <Link href="/activities" onClick={closeMenu}>
                  <DropdownMenuItem>
                    <Trees className="mr-2 h-4 w-4" />
                    <span>All Activities</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                {loading.activities ? (
                  <DropdownMenuItem disabled>Loading activities...</DropdownMenuItem>
                ) : activities.length > 0 ? (
                  <>
                    {/* Group activities by park */}
                    {Object.entries(
                      activities.reduce(
                        (acc, activity) => {
                          const parkId = activity.parkId || "unknown"
                          const parkName = getParkName(parkId)
                          console.log(parkName)

                          if (!acc[parkId]) {
                            acc[parkId] = {
                              parkName,
                              activities: [],
                            }
                          }

                          acc[parkId].activities.push(activity)
                          return acc
                        },
                        {} as Record<string, { parkName: string; activities: Activity[] }>,
                      ),
                    ).map(([parkId, { parkName, activities: parkActivities }]) => (
                      <div key={parkId}>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">{parkName}</div>
                        {parkActivities.map((activity) => (
                          <DropdownMenuItem key={activity._id} onClick={() => navigateToActivity(parkId, activity._id)}>
                            <span className="ml-6">{activity.name}</span>
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                      </div>
                    ))}
                  </>
                ) : (
                  <DropdownMenuItem disabled>No activities available</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link
              href="/aboutUs"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/aboutUs" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              About
            </Link>

            <Link
              href="/news"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/news" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              News
            </Link>

            <Link
              href="/Contact"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/Contact" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Contact
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {!isLoading && (
              <>
                {isAuthenticated && user ? (
                  <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="icon" className="relative" onClick={handleCartClick}>
                      <ShoppingCart className="h-5 w-5" />
                      {totalItems > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                          {totalItems}
                        </span>
                      )}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full">
                          <User className="h-5 w-5" />
                          <span className="sr-only">User menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <div className="px-4 py-3 border-b">
                          <p className="text-sm font-medium">{user.username || user.name || "User"}</p>
                          <p className="text-xs text-muted-foreground mt-1">{user.email}</p>
                        </div>
                        <DropdownMenuItem asChild>
                          <Link href="/profile">
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/reservation">
                            <Calendar className="mr-2 h-4 w-4" />
                            <span>My Reservations</span>
                          </Link>
                        </DropdownMenuItem>
                        {user.role === "admin" && (
                          <DropdownMenuItem asChild>
                            <Link href="/dashboard">
                              <Settings className="mr-2 h-4 w-4" />
                              <span>Dashboard</span>
                            </Link>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleSignOut}>
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Log out</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => authModal.onOpen("login")}>
                      Log in
                    </Button>
                    <Button size="sm" onClick={() => authModal.onOpen("signup")}>
                      Sign up
                    </Button>
                  </div>
                )}
              </>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={toggleMenu}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="space-y-1 px-4 py-3 border-t">
            <Link
              href="/"
              className={`block py-2 px-3 text-base font-medium rounded-md ${
                pathname === "/"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              onClick={closeMenu}
            >
              Home
            </Link>

            {/* Parks mobile dropdown */}
            <div className="space-y-1">
              <button
                className={`flex w-full justify-between items-center py-2 px-3 text-base font-medium rounded-md ${
                  pathname?.startsWith("/park")
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
                onClick={() => {
                  const parksSubmenu = document.getElementById("mobile-parks-submenu")
                  if (parksSubmenu) {
                    parksSubmenu.classList.toggle("hidden")
                  }
                }}
              >
                <span>Parks</span>
                <ChevronDown className="h-4 w-4" />
              </button>

              <div id="mobile-parks-submenu" className="hidden pl-6 space-y-1">
                <Link
                  href="/park"
                  className="block py-2 px-3 text-base font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                  onClick={closeMenu}
                >
                  All Parks
                </Link>
                {parks.map((park) => (
                  <Link
                    key={park._id}
                    href={`/park/${park._id}`}
                    className="block py-2 px-3 text-base font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                    onClick={closeMenu}
                  >
                    {park.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Activities mobile dropdown */}
            <div className="space-y-1">
              <button
                className={`flex w-full justify-between items-center py-2 px-3 text-base font-medium rounded-md ${
                  pathname === "/activities"
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
                onClick={() => {
                  const activitiesSubmenu = document.getElementById("mobile-activities-submenu")
                  if (activitiesSubmenu) {
                    activitiesSubmenu.classList.toggle("hidden")
                  }
                }}
              >
                <span>Activities</span>
                <ChevronDown className="h-4 w-4" />
              </button>

              <div id="mobile-activities-submenu" className="hidden pl-6 space-y-1">
                <Link
                  href="/activities"
                  className="block py-2 px-3 text-base font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                  onClick={closeMenu}
                >
                  All Activities
                </Link>

                {/* Group activities by park for mobile */}
                {Object.entries(
                  activities.reduce(
                    (acc, activity) => {
                      const parkId = activity.park?._id || "unknown"
                      const parkName = activity.park?.name || "Unknown Park"

                      if (!acc[parkId]) {
                        acc[parkId] = {
                          parkName,
                          activities: [],
                        }
                      }

                      acc[parkId].activities.push(activity)
                      return acc
                    },
                    {} as Record<string, { parkName: string; activities: Activity[] }>,
                  ),
                ).map(([parkId, { parkName, activities: parkActivities }]) => (
                  <div key={parkId}>
                    <p className="text-xs font-semibold text-muted-foreground py-1 px-3">{parkName}</p>
                    {parkActivities.map((activity) => (
                      <button
                        key={activity._id}
                        className="block w-full text-left py-2 px-3 pl-6 text-base font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                        onClick={() => navigateToActivity(parkId, activity._id)}
                      >
                        {activity.name}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <Link
              href="/aboutUs"
              className={`block py-2 px-3 text-base font-medium rounded-md ${
                pathname === "/aboutUs"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              onClick={closeMenu}
            >
              About
            </Link>

            <Link
              href="/news"
              className={`block py-2 px-3 text-base font-medium rounded-md ${
                pathname === "/news"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              onClick={closeMenu}
            >
              News
            </Link>

            <Link
              href="/Contact"
              className={`block py-2 px-3 text-base font-medium rounded-md ${
                pathname === "/Contact"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              onClick={closeMenu}
            >
              Contact
            </Link>

            {isAuthenticated && user ? (
              <>
                <div className="border-t border-gray-200 pt-4 pb-3">
                  <div className="px-3">
                    <p className="text-base font-medium">{user.username || user.name || "User"}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="mt-3 space-y-1">
                    <Link
                      href="/profile"
                      className="block py-2 px-3 text-base font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                      onClick={closeMenu}
                    >
                      Profile
                    </Link>
                    <Link
                      href="/reservation"
                      className="block py-2 px-3 text-base font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                      onClick={closeMenu}
                    >
                      My Reservations
                    </Link>
                    {user.role === "admin" && (
                      <Link
                        href="/dashboard"
                        className="block py-2 px-3 text-base font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                        onClick={closeMenu}
                      >
                        Dashboard
                      </Link>
                    )}
                    <button
                      className="block w-full text-left py-2 px-3 text-base font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                      onClick={handleSignOut}
                    >
                      Log out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="border-t border-gray-200 pt-4 pb-3">
                <div className="space-y-2 px-3">
                  <button
                    className="block w-full text-left py-2 px-3 text-base font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                    onClick={() => handleAuthClick("login")}
                  >
                    Log in
                  </button>
                  <button
                    className="block w-full text-left py-2 px-3 text-base font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => handleAuthClick("signup")}
                  >
                    Sign up
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
