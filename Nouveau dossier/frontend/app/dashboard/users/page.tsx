import type { Metadata } from "next"
import { UsersList } from "@/components/users/users-list"
import ProtectedRoute from "@/components/auth/protected-route"

export const metadata: Metadata = {
  title: "Users Management",
  description: "Manage users in the system",
}

export default function UsersPage() {
  return (
    <ProtectedRoute requiredRole="admin" redirectTo="/dashboard">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">Manage user accounts and permissions</p>
        </div>
        <UsersList />
      </div>
    </ProtectedRoute>
  )
}
