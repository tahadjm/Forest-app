"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
  FileText,
  ChevronRight,
  Bell,
  Search,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components-admin/ui/sheet"
import { cn } from "@/lib/utils"
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
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/context/auth-context"

interface SidebarNavProps {
  isCollapsed: boolean
  links: {
    title: string
    label?: string
    icon: React.ReactNode
    variant: "default" | "ghost"
    href: string
  }[]
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const pathname = usePathname()
  const [isMounted, setIsMounted] = useState(false)
  const router = useRouter()
  const { user, logout } = useAuth()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const links = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      variant: pathname === "/dashboard" ? "default" : "ghost",
    },
    {
      title: "Parks",
      href: "/dashboard/parks",
      icon: <Map className="h-5 w-5" />,
      variant: pathname.includes("/dashboard/parks") ? "default" : "ghost",
    },
    {
      title: "Activities",
      href: "/dashboard/activities",
      icon: <TreePine className="h-5 w-5" />,
      variant: pathname.includes("/dashboard/activities") ? "default" : "ghost",
    },
    {
      title: "Parcours",
      href: "/dashboard/parcours",
      icon: <BookOpen className="h-5 w-5" />,
      variant: pathname.includes("/dashboard/parcours") ? "default" : "ghost",
    },
    {
      title: "Pricing",
      href: "/dashboard/pricing",
      icon: <Tag className="h-5 w-5" />,
      variant: pathname.includes("/dashboard/pricing") ? "default" : "ghost",
    },
    {
      title: "Bookings",
      href: "/dashboard/bookings",
      icon: <Calendar className="h-5 w-5" />,
      variant: pathname.includes("/dashboard/bookings") ? "default" : "ghost",
      label: "5",
    },
    {
      title: "Time Slots",
      href: "/dashboard/time-slots",
      icon: <Clock className="h-5 w-5" />,
      variant: pathname.includes("/dashboard/time-slots") ? "default" : "ghost",
    },
    {
      title: "Users",
      href: "/dashboard/users",
      icon: <Users className="h-5 w-5" />,
      variant: pathname.includes("/dashboard/users") ? "default" : "ghost",
    },
    {
      title: "Content",
      href: "/dashboard/content",
      icon: <FileText className="h-5 w-5" />,
      variant: pathname.includes("/dashboard/content") ? "default" : "ghost",
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: <Settings className="h-5 w-5" />,
      variant: pathname.includes("/dashboard/settings") ? "default" : "ghost",
    },
  ]

  const handleLogout = () => {
    logout()
    router.push("/admin/login")
  }

  if (!isMounted) {
    return null
  }

  return (
    <div className="flex min-h-screen w-full bg-muted/20">
      {/* Mobile Navigation */}
      <nav className="fixed top-0 z-50 flex h-16 w-full items-center border-b bg-background px-4 lg:hidden">
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="mr-2">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] sm:w-[300px] p-0">
            <div className="flex h-16 items-center border-b px-6">
              <h2 className="text-lg font-semibold">Adventure Park CMS</h2>
            </div>
            <nav className="flex flex-col gap-1 p-4">
              {links.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setIsMobileOpen(false)}>
                  <Button variant={link.variant} className="w-full justify-start">
                    {link.icon}
                    <span className="ml-2">{link.title}</span>
                    {link.label && (
                      <Badge className="ml-auto" variant="secondary">
                        {link.label}
                      </Badge>
                    )}
                  </Button>
                </Link>
              ))}
              <div className="mt-4 pt-4 border-t">
                <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex w-full items-center justify-between">
          <span className="font-semibold">Adventure Park CMS</span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
              <Badge
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center"
                variant="destructive"
              >
                3
              </Badge>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder-user.jpg" alt="User" />
                    <AvatarFallback>{user?.username?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 flex-col lg:flex-row">
        {/* Desktop Sidebar */}
        <aside
          className={cn(
            "fixed top-0 z-30 hidden h-screen border-r bg-background transition-all duration-300 lg:block",
            isCollapsed ? "w-[70px]" : "w-[240px]",
          )}
        >
          <div className="flex h-full flex-col">
            <div className="flex h-16 items-center justify-between border-b px-4">
              {!isCollapsed && (
                <span className="text-lg font-semibold flex items-center">
                  <TreePine className="h-5 w-5 mr-2 text-primary-500" />
                  Adventure Park
                </span>
              )}
              <Button
                variant="ghost"
                size="icon"
                className={isCollapsed ? "mx-auto" : "ml-auto"}
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <X className="h-5 w-5" />}
                <span className="sr-only">Toggle Sidebar</span>
              </Button>
            </div>
            <SidebarNav isCollapsed={isCollapsed} links={links} />
            <div className="mt-auto p-4 border-t">
              <Button
                variant="outline"
                className={cn("w-full", isCollapsed ? "justify-center px-0" : "justify-start")}
                onClick={handleLogout}
              >
                <LogOut className={cn("h-5 w-5", !isCollapsed && "mr-2")} />
                {!isCollapsed && "Logout"}
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main
          className={cn(
            "flex-1 overflow-y-auto transition-all duration-300",
            "lg:ml-[240px] lg:w-[calc(100%-240px)]",
            isCollapsed && "lg:ml-[70px] lg:w-[calc(100%-70px)]",
            "pt-16 lg:pt-0",
          )}
        >
          {/* Top Navigation Bar for Desktop */}
          <div className="hidden lg:flex h-16 items-center justify-between border-b bg-background px-6">
            <div className="flex items-center w-1/3">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="w-full pl-8 bg-muted/40 border-none focus-visible:ring-1"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifications</span>
                <Badge
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center"
                  variant="destructive"
                >
                  3
                </Badge>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder-user.jpg" alt="User" />
                      <AvatarFallback>{user?.username?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    {user?.username && <span className="font-medium">{user.username}</span>}
                    <span className="sr-only">User menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="container mx-auto p-4 lg:p-6">{children}</div>
        </main>
      </div>
    </div>
  )
}

function SidebarNav({ links, isCollapsed }: SidebarNavProps) {
  return (
    <div data-collapsed={isCollapsed} className="group flex flex-col gap-1 py-4 data-[collapsed=true]:py-4">
      <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
        {links.map((link, index) => (
          <Link
            key={index}
            href={link.href}
            className={isCollapsed ? "h-10 w-10 rounded-md flex items-center justify-center" : ""}
          >
            <Button
              variant={link.variant}
              className={cn(
                isCollapsed ? "h-10 w-10 p-0 justify-center" : "w-full justify-start",
                "relative",
                link.variant === "default" && "bg-primary-500 hover:bg-primary-600 text-white",
              )}
            >
              {link.icon}
              {!isCollapsed && <span className="ml-2">{link.title}</span>}
              {link.label && (
                <Badge
                  className={cn(
                    "absolute right-2 top-1/2 -translate-y-1/2 ml-auto",
                    isCollapsed && "right-0 top-0 translate-x-1/3 -translate-y-1/3",
                  )}
                  variant="secondary"
                >
                  {link.label}
                </Badge>
              )}
            </Button>
          </Link>
        ))}
      </nav>
    </div>
  )
}
