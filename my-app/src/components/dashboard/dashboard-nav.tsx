"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Map, TreePine, Tag, Calendar, Clock, BookOpen, Users, Settings, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"

export function DashboardNav() {
  const pathname = usePathname()

  const routes = [
    {
      href: "/dashboard",
      icon: <LayoutDashboard className="mr-2 h-4 w-4" />,
      title: "Dashboard",
      variant: pathname === "/dashboard" ? "default" : "ghost",
    },
    {
      href: "/dashboard/parks",
      icon: <Map className="mr-2 h-4 w-4" />,
      title: "Parks",
      variant: pathname.includes("/dashboard/parks") ? "default" : "ghost",
    },
    {
      href: "/dashboard/activities",
      icon: <TreePine className="mr-2 h-4 w-4" />,
      title: "Activities",
      variant: pathname.includes("/dashboard/activities") ? "default" : "ghost",
    },
    {
      href: "/dashboard/pricing",
      icon: <Tag className="mr-2 h-4 w-4" />,
      title: "Pricing",
      variant: pathname.includes("/dashboard/pricing") ? "default" : "ghost",
    },
    {
      href: "/dashboard/bookings",
      icon: <Calendar className="mr-2 h-4 w-4" />,
      title: "Bookings",
      variant: pathname.includes("/dashboard/bookings") ? "default" : "ghost",
    },
    {
      href: "/dashboard/time-slots",
      icon: <Clock className="mr-2 h-4 w-4" />,
      title: "Time Slots",
      variant: pathname.includes("/dashboard/time-slots") ? "default" : "ghost",
    },
    {
      href: "/dashboard/users",
      icon: <Users className="mr-2 h-4 w-4" />,
      title: "Users",
      variant: pathname.includes("/dashboard/users") ? "default" : "ghost",
    },
    {
      href: "/dashboard/content",
      icon: <FileText className="mr-2 h-4 w-4" />,
      title: "Content",
      variant: pathname.includes("/dashboard/content") ? "default" : "ghost",
    },
    {
      href: "/dashboard/settings",
      icon: <Settings className="mr-2 h-4 w-4" />,
      title: "Settings",
      variant: pathname.includes("/dashboard/settings") ? "default" : "ghost",
    },
  ]

  return (
    <nav className="grid items-start gap-2">
      {routes.map((route, index) => (
        <Link key={index} href={route.href}>
          <Button variant={route.variant as "default" | "ghost"} size="sm" className="w-full justify-start">
            {route.icon}
            {route.title}
          </Button>
        </Link>
      ))}
    </nav>
  )
}
