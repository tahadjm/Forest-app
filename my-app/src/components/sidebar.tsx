"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  ActivitySquare,
  CalendarRange,
  Clock,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Map,
  Route,
  Settings,
  Tag,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/context/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: "Parks",
    href: "/dashboard/parks",
    icon: <Map className="h-5 w-5" />,
  },
  {
    title: "Activities",
    href: "/dashboard/activities",
    icon: <ActivitySquare className="h-5 w-5" />,
  },
  {
    title: "Parcours",
    href: "/dashboard/parcours",
    icon: <Route className="h-5 w-5" />,
  },
  {
    title: "Pricing",
    href: "/dashboard/pricing",
    icon: <Tag className="h-5 w-5" />,
  },
  {
    title: "Bookings",
    href: "/dashboard/bookings",
    icon: <CalendarRange className="h-5 w-5" />,
  },
  {
    title: "Time Slots",
    href: "/dashboard/time-slots",
    icon: <Clock className="h-5 w-5" />,
  },
  {
    title: "Users",
    href: "/dashboard/users",
    icon: <Users className="h-5 w-5" />,
  },
  {
    title: "Payments",
    href: "/dashboard/payments",
    icon: <CreditCard className="h-5 w-5" />,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: <Settings className="h-5 w-5" />,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const getInitials = (name: string) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <div className="hidden border-r bg-background/95 backdrop-blur-sm md:block md:w-64 lg:w-72">
      <div className="flex h-full flex-col">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <ActivitySquare className="h-6 w-6 text-primary" />
            <span className="text-lg">Adventure Park</span>
          </Link>
        </div>
        <ScrollArea className="flex-1 py-2">
          <nav className="grid gap-1 px-2">
            {sidebarItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-2",
                    pathname === item.href && "bg-muted font-medium text-primary",
                    pathname.startsWith(item.href) && item.href !== "/dashboard" && "bg-muted/50 text-primary",
                  )}
                >
                  {item.icon}
                  {item.title}
                </Button>
              </Link>
            ))}
          </nav>
        </ScrollArea>
        <div className="border-t p-4">
          {user && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.image || ""} alt={user.name || "User"} />
                  <AvatarFallback>{getInitials(user.name || "User")}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium">{user.name || "Admin User"}</span>
                  <span className="text-xs text-muted-foreground">{user.email}</span>
                </div>
              </div>
              <Separator />
              <Button variant="outline" className="w-full justify-start gap-2" onClick={logout}>
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
