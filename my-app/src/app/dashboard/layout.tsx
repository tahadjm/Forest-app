import type React from "react"
import type { Metadata } from "next"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import ProtectedRoute from "@/components/auth/protected-route"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Admin dashboard for managing the application",
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute requiredRole={["admin", "sous admin"]} redirectTo="/">
      <div className="flex min-h-screen flex-col">
        <div className="flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
          <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
            <div className="py-6 pr-6 lg:py-8">
              <DashboardNav />
            </div>
          </aside>
          <main className="relative py-6 lg:gap-10 lg:py-8">
            <div className="mx-auto w-full min-w-0">{children}</div>
          </main>
        </div>
        <Toaster />
      </div>
    </ProtectedRoute>
  )
}
