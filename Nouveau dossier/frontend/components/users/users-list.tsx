"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, Edit, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProtectedComponent } from "@/components/protectedComponent"
import { useAuth } from "@/context/auth-context"
import toast from "react-hot-toast"
import axiosInstance from "@/lib/axios-setup"

interface User {
  _id: string
  username: string
  email: string
  role: string
  createdAt: string
}

export function UsersList() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const { user: currentUser } = useAuth()

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const response = await axiosInstance.get("/auth/users")
        console.log("Fetched users:", response.data)
        if (response.data.success) {
          setUsers(response.data.data || [])
        }
      } catch (error) {
        console.error("Failed to fetch users:", error)
        toast.error("Failed to load users")
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return

    try {
      const response = await axiosInstance.delete(`/auth/users/${userId}`)
      if (response.data.success) {
        setUsers(users.filter((user) => user._id !== userId))
        toast.success("User deleted successfully")
      } else {
        toast.error(response.data.message || "Failed to delete user")
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      toast.error("Failed to delete user")
    }
  }

  if (loading) {
    return <div className="text-center py-10">Loading users...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">All Users</h2>
        <ProtectedComponent requiredRole="admin">
          <Link href="/dashboard/users/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </Link>
        </ProtectedComponent>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Role</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Joined</th>
              <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id} className="border-t">
                  <td className="px-4 py-3 text-sm">{user.username}</td>
                  <td className="px-4 py-3 text-sm">{user.email}</td>
                  <td className="px-4 py-3 text-sm capitalize">{user.role}</td>
                  <td className="px-4 py-3 text-sm">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-sm text-right">
                    <div className="flex justify-end gap-2">
                      <ProtectedComponent requiredRole="admin">
                        <Link href={`/dashboard/users/${user._id}`}>
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                        </Link>
                      </ProtectedComponent>
                      <ProtectedComponent requiredRole="admin">
                        {/* Don't allow deleting yourself */}
                        {currentUser?.id !== user._id && (
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(user._id)}>
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        )}
                      </ProtectedComponent>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
