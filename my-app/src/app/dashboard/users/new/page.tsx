import { UserForm } from "@/components/users/user-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import ProtectedRoute from "@/components/auth/protected-route"

export default function NewUserPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Link href="/dashboard/users">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Add New User</h1>
        </div>
        <UserForm />
      </div>
    </ProtectedRoute>
  )
}
