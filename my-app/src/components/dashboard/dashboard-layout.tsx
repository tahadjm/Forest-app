"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Map,
  TreePine,
  Tag,
  Calendar,
  Clock,
  BookOpen,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/context/auth-context"
import { ThemeToggle } from "@/components/theme-toggle"

interface SidebarNavProps {
  isCollapsed: boolean
  links: {
    title: string
    label?: string
    icon: React.ReactNode
    variant: "default" | "ghost"
    href: string
    requiredRole?: string | string[]
  }[]
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout, hasPermission } = useAuth()

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
  }

  const userInitials = user?.name ? getInitials(user.name) : "U"

  const links = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      variant: pathname === "/dashboard" ? "default" : "ghost",
      requiredRole: ["admin", "sous admin"],
    },
    {
      title: "Parks",
      href: "/dashboard/parks",
      icon: <Map className="h-5 w-5" />,
      variant: pathname.includes("/parks") ? "default" : "ghost",
      requiredRole: ["admin", "sous admin"],
    },
    {
      title: "Activities",
      href: "/dashboard/activities",
      icon: <TreePine className="h-5 w-5" />,
      variant: pathname.includes("/activities") ? "default" : "ghost",
      requiredRole: ["admin", "sous admin"],
    },
    {
      title: "Parcours",
      href: "/dashboard/parcours",
      icon: <BookOpen className="h-5 w-5" />,
      variant: pathname.includes("/parcours") ? "default" : "ghost",
      requiredRole: ["admin", "sous admin"],
    },
    {
      title: "Pricing",
      href: "/dashboard/pricing",
      icon: <Tag className="h-5 w-5" />,
      variant: pathname.includes("/pricing") ? "default" : "ghost",
      requiredRole: ["admin", "sous admin"],
    },
    {
      title: "Bookings",
      href: "/dashboard/bookings",
      icon: <Calendar className="h-5 w-5" />,
      variant: pathname.includes("/bookings") ? "default" : "ghost",
      requiredRole: ["admin", "sous admin"],
    },
    {
      title: "Time Slots",
      href: "/dashboard/time-slots",
      icon: <Clock className="h-5 w-5" />,
      variant: pathname.includes("/time-slots") ? "default" : "ghost",
      requiredRole: ["admin", "sous admin"],
    },
    {
      title: "Users",
      href: "/dashboard/users",
      icon: <Users className="h-5 w-5" />,
      variant: pathname.includes("/users") ? "default" : "ghost",
      requiredRole: "admin", // Only admins can manage users
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: <Settings className="h-5 w-5" />,
      variant: pathname.includes("/settings") ? "default" : "ghost",
      requiredRole: ["admin", "sous admin"],
    },
  ]

  // Filter links based on user permissions
  const filteredLinks = links.filter((link) => !link.requiredRole || hasPermission(link.requiredRole))

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0 md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] sm:w-[300px]">
            <div className="flex h-full flex-col">
              <div className="px-2 py-4">
                <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Adventure Park CMS</h2>
                <div className="space-y-1">
                  {filteredLinks.map((link) => (
                    <Link key={link.href} href={link.href} onClick={() => setIsMobileOpen(false)}>
                      <Button variant={link.variant} className="w-full justify-start">
                        {link.icon}
                        <span className="ml-2">{link.title}</span>
                      </Button>
                    </Link>
                  ))}
                </div>
              </div>
              <div className="mt-auto px-6 py-2">
                <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <Link href="/dashboard" className="flex items-center gap-2 md:hidden">
          <TreePine className="h-6 w-6" />
          <span className="font-bold">Adventure Park</span>
        </Link>
        <div className="w-full flex-1 md:grow-0">
          <form>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[300px]"
              />
            </div>
          </form>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1 top-1 flex h-2 w-2 rounded-full bg-primary"></span>
            <span className="sr-only">Notifications</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar || ""} alt={user?.name || "User"} />
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside className={`hidden border-r bg-background lg:block ${isCollapsed ? "w-[70px]" : "w-[240px]"}`}>
          <div className="flex h-full flex-col gap-2">
            <div className="flex h-14 items-center border-b px-4">
              {!isCollapsed && (
                <Link href="/dashboard" className="flex items-center gap-2">
                  <TreePine className="h-6 w-6" />
                  <span className="font-bold">Adventure Park</span>
                </Link>
              )}
              <Button
                variant="ghost"
                size="icon"
                className={`${isCollapsed ? "mx-auto" : "ml-auto"}`}
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
                <span className="sr-only">Toggle Sidebar</span>
              </Button>
            </div>
            <SidebarNav isCollapsed={isCollapsed} links={filteredLinks} />
            <div className="mt-auto p-4">
              <Button
                variant="outline"
                className={`w-full ${isCollapsed ? "justify-center px-0" : "justify-start"}`}
                onClick={handleLogout}
              >
                <LogOut className={`h-4 w-4 ${!isCollapsed && "mr-2"}`} />
                {!isCollapsed && "Logout"}
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}

function SidebarNav({ links, isCollapsed }: SidebarNavProps) {
  return (
    <div data-collapsed={isCollapsed} className="group flex flex-col gap-4 py-2 data-[collapsed=true]:py-2">
      <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
        {links.map((link, index) => (
          <Link
            key={index}
            href={link.href}
            className={isCollapsed ? "h-9 w-9 rounded-md flex items-center justify-center" : ""}
          >
            <Button
              variant={link.variant}
              className={isCollapsed ? "h-9 w-9 p-0 justify-center" : "w-full justify-start"}
            >
              {link.icon}
              {!isCollapsed && <span className="ml-2">{link.title}</span>}
            </Button>
          </Link>
        ))}
      </nav>
    </div>
  )
}
