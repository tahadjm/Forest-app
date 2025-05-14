"use client"

import { useParams } from "next/navigation"
import { UserForm } from "@/components/users/user-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import ProtectedRoute from "@/components/auth/protected-route"

export default function EditUserPage() {
  const { id } = useParams() as { id: string }

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Link href="/dashboard/users">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Edit User</h1>
        </div>
        {id ? <UserForm userId={id} /> : <p>Loading...</p>}
      </div>
    </ProtectedRoute>
  )
}
