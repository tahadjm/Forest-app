import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Overview } from "@/components/dashboard/overview"
import { RecentBookings } from "@/components/dashboard/recent-bookings"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      <div className="space-y-4">
        <DashboardStats />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Overview</CardTitle>
              <CardDescription>Booking overview for the current month</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <Overview />
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
              <CardDescription>Latest bookings across all parks</CardDescription>
            </CardHeader>
            <CardContent>
              <RecentBookings />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
