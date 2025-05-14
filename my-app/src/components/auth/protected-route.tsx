"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/context/auth-context"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: string | string[]
  redirectTo?: string
  fallback?: React.ReactNode
}

/**
 * A unified component for protecting routes based on authentication and role
 *
 * @param children - The content to render if authorized
 * @param requiredRole - The role(s) required to access this route ("admin", "sous admin", or array of roles)
 * @param redirectTo - Where to redirect if unauthorized (defaults to home page)
 * @param fallback - Optional component to show while checking auth status
 */
const ProtectedRoute = ({ children, requiredRole, redirectTo = "/", fallback }: ProtectedRouteProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, isLoading, hasPermission } = useAuth()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Only proceed with checks after the initial auth check is complete
    if (!isLoading) {
      if (!isAuthenticated) {
        // Redirect to login with callback URL
        const callbackUrl = encodeURIComponent(pathname)
        router.push(`${redirectTo}?auth=login&callbackUrl=${callbackUrl}`)
      } else if (requiredRole && !hasPermission(requiredRole)) {
        // If specific role is required but user doesn't have permission
        router.push(redirectTo)
      } else {
        setIsChecking(false)
      }
    }
  }, [isAuthenticated, user, isLoading, requiredRole, router, redirectTo, pathname, hasPermission])

  // Show loading spinner or fallback while checking authentication
  if (isLoading || isChecking) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )
    )
  }

  // If we're here, the user is authenticated and has the right permissions
  return <>{children}</>
}

export default ProtectedRoute
