"use client"
import { useEffect, useState } from "react"
import type React from "react"
import { useAuth } from "@/context/auth-context"

interface ProtectedComponentProps {
  children: React.ReactNode
  requiredRole?: string | string[]
  fallback?: React.ReactNode | null
}

/**
 * A component that conditionally renders its children based on user authentication and role
 * Unlike ProtectedRoute, this doesn't redirect - it just conditionally renders
 *
 * @param children - The content to render if authorized
 * @param requiredRole - The role(s) required to view this component (defaults to "admin")
 * @param fallback - Optional component to render if unauthorized (defaults to null)
 */
export function ProtectedComponent({ children, requiredRole = "admin", fallback = null }: ProtectedComponentProps) {
  const { user, isLoading, hasPermission } = useAuth()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    // Check authorization when auth state changes
    if (!isLoading) {
      setIsAuthorized(hasPermission(requiredRole))
    }
  }, [user, isLoading, requiredRole, hasPermission])

  // While loading, show nothing
  if (isLoading) return null

  // If not authorized, show fallback or nothing
  if (!isAuthorized) return fallback

  // If authorized, show the children
  return <>{children}</>
}
