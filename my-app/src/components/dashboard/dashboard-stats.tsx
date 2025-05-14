"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, CreditCard, Calendar, TrendingUp } from "lucide-react"

export function DashboardStats() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    bookingRate: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate fetching stats from API
    const fetchStats = async () => {
      setLoading(true)
      try {
        // In a real app, this would be an API call
        // For now, we'll use mock data
        setTimeout(() => {
          setStats({
            totalUsers: 1250,
            totalBookings: 3890,
            totalRevenue: 128750,
            bookingRate: 68,
          })
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Failed to fetch stats:", error)
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Users"
        value={stats.totalUsers.toLocaleString()}
        description="Active users this month"
        icon={<Users className="h-4 w-4 text-muted-foreground" />}
        loading={loading}
      />
      <StatsCard
        title="Total Bookings"
        value={stats.totalBookings.toLocaleString()}
        description="Bookings this month"
        icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
        loading={loading}
      />
      <StatsCard
        title="Total Revenue"
        value={`€${stats.totalRevenue.toLocaleString()}`}
        description="Revenue this month"
        icon={<CreditCard className="h-4 w-4 text-muted-foreground" />}
        loading={loading}
      />
      <StatsCard
        title="Booking Rate"
        value={`${stats.bookingRate}%`}
        description="Conversion rate"
        icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        loading={loading}
      />
    </div>
  )
}

function StatsCard({
  title,
  value,
  description,
  icon,
  loading,
}: {
  title: string
  value: string
  description: string
  icon: React.ReactNode
  loading: boolean
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-9 w-24 animate-pulse rounded-md bg-muted"></div>
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}
