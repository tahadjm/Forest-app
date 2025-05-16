"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import axiosInstance from "@/lib/axios-setup"
import { isTokenExpired } from "@/utils/auth"

// Define types for user and auth context
type User = {
  id: string
  name: string
  email: string
  role: string
  username?: string
  avatar?: string
} | null

type AuthContextType = {
  user: User
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  signup: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  forgotPassword: (email: string) => Promise<boolean>
  resetPassword: (token: string, password: string) => Promise<boolean>
  checkAdminAccess: () => boolean
  checkManagerAccess: () => boolean
  hasPermission: (requiredRole: string | string[]) => boolean
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Auth provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Standardize token handling - use cookies for better security
  const getToken = () => {
    if (typeof window === "undefined") return null

    // Try to get from localStorage first (for backward compatibility)
    const localToken = localStorage.getItem("token")

    // Get token from cookie
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`
      const parts = value.split(`; ${name}=`)
      if (parts.length === 2) return parts.pop()?.split(";").shift()
      return null
    }

    const cookieToken = getCookie("token")

    return cookieToken || localToken
  }

  const setToken = (token: string) => {
    if (typeof window === "undefined") return

    // Set in localStorage for backward compatibility
    localStorage.setItem("token", token)

    // Set secure, httpOnly cookie for better security
    document.cookie = `token=${token}; path=/; max-age=2592000; SameSite=Strict` // 30 days
  }

  const clearToken = () => {
    if (typeof window === "undefined") return

    // Clear from localStorage
    localStorage.removeItem("token")
    localStorage.removeItem("user")

    // Clear cookie
    document.cookie = "token=; path=/; max-age=0"
  }

  // Check if token is expired
  const checkTokenExpiration = (token: string | null) => {
    if (!token) return true

    try {
      return isTokenExpired(token)
    } catch (error) {
      console.error("Error checking token expiration:", error)
      return true
    }
  }

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check for token
        const token = getToken()

        if (token && !checkTokenExpiration(token)) {
          // Validate token with API
          try {
            const response = await axiosInstance.get("/auth/profile")

            if (response.data.success && response.data.data) {
              setUser(response.data.data)
              // Store user data in localStorage for offline access
              localStorage.setItem("user", JSON.stringify(response.data.data))
            } else {
              clearToken()
              setUser(null)
            }
          } catch (error) {
            console.error("Auth validation error:", error)
            clearToken()
            setUser(null)

            // Show error toast for invalid token
            toast.error("Your session has expired. Please log in again.")
          }
        } else if (token && checkTokenExpiration(token)) {
          // Token is expired
          clearToken()
          setUser(null)
          toast.error("Your session has expired. Please log in again.")
        } else {
          // Try to load user from localStorage if available
          const storedUser = localStorage.getItem("user")
          if (storedUser) {
            try {
              setUser(JSON.parse(storedUser))
            } catch (e) {
              localStorage.removeItem("user")
            }
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()

    // Also check for token in URL (for OAuth redirects)
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search)
      const tokenFromUrl = urlParams.get("token")

      if (tokenFromUrl) {
        setToken(tokenFromUrl)
        // Remove token from URL to prevent leaking
        window.history.replaceState({}, document.title, window.location.pathname)
        // Refresh to apply the token
        window.location.reload()
      }
    }
  }, [])

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // Assuming authService is available in this scope, you might need to import it
      // import { authService } from './auth-service'; // Adjust the path as needed
      const response = await axiosInstance.post("/auth/signin", { email, password })
      const data = response.data

      if (!data.success) {
        toast.error(data.message || "Login failed")
        return false
      }

      // Save token
      setToken(data.token)

      // Save user data
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user))
        setUser(data.user)
      }

      // Force a hard refresh to ensure all components update
      toast.success("Logged in successfully!")

      // Use a short timeout to ensure the toast is visible before refresh
      setTimeout(() => {
        window.location.reload()
      }, 1000)

      return true
    } catch (error: any) {
      console.error("Login error:", error)
      toast.error(error.response?.data?.message || "Login failed. Please try again.")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Signup function
  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      const response = await axiosInstance.post("/auth/signup", {
        username: name,
        email,
        password,
      })
      const data = response.data

      if (!data.success) {
        toast.error(data.message || "Signup failed")
        return false
      }

      // Save token if provided
      if (data.token) {
        setToken(data.token)
      }

      // Save user data if provided
      if (data.result) {
        const userData = {
          id: data.result._id,
          name: data.result.username || name,
          email: data.result.email,
          role: data.result.role || "user",
        }
        localStorage.setItem("user", JSON.stringify(userData))
        setUser(userData)
      }

      toast.success("Account created successfully!")

      // Force a hard refresh to ensure all components update
      setTimeout(() => {
        window.location.reload()
      }, 1000)

      return true
    } catch (error: any) {
      console.error("Signup error:", error)
      toast.error(error.response?.data?.message || "Signup failed. Please try again.")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function
  const logout = () => {
    clearToken()
    setUser(null)

    // Call the backend logout endpoint
    axiosInstance.post("/auth/signout").catch((error) => console.error("Logout error:", error))

    toast.success("Logged out successfully")

    // Force a hard refresh to ensure all components update
    setTimeout(() => {
      window.location.href = "/"
    }, 1000)
  }

  // Forgot password function
  const forgotPassword = async (email: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      const response = await axiosInstance.patch("/auth/forgetpsw", { email })
      const data = response.data

      if (!data.success) {
        toast.error(data.message || "Request failed")
        return false
      }

      toast.success("Password reset instructions sent to your email")
      return true
    } catch (error: any) {
      console.error("Forgot password error:", error)
      toast.error(error.response?.data?.message || "Request failed. Please try again.")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Reset password function
  const resetPassword = async (token: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      const response = await axiosInstance.patch("/auth/forgetpswvalidation", {
        email: token, // In this API, token is actually the email
        providedcode: token.split("-")[1], // Assuming format email-code
        newPassword: password,
      })
      const data = response.data

      if (!data.success) {
        toast.error(data.message || "Password reset failed")
        return false
      }

      toast.success("Password reset successful. Please log in.")
      return true
    } catch (error: any) {
      console.error("Reset password error:", error)
      toast.error(error.response?.data?.message || "Password reset failed. Please try again.")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Check if user has admin access
  const checkAdminAccess = (): boolean => {
    return user?.role === "admin"
  }

  // Check if user has manager (sous admin) access
  const checkManagerAccess = (): boolean => {
    return user?.role === "sous admin" || user?.role === "admin"
  }

  // Check if user has permission based on required role(s)
  const hasPermission = (requiredRole: string | string[]): boolean => {
    if (!user) return false

    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(user.role)
    }

    if (requiredRole === "admin") {
      return user.role === "admin"
    }

    if (requiredRole === "manager" || requiredRole === "sous admin") {
      return user.role === "admin" || user.role === "sous admin"
    }

    return true // Regular user access
  }

  // Provide auth context value
  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    forgotPassword,
    resetPassword,
    checkAdminAccess,
    checkManagerAccess,
    hasPermission,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
