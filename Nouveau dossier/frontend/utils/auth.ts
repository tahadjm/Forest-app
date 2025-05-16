"use client"

// Utility functions for authentication

/**
 * Get the authentication token from cookies (primary) or localStorage (fallback)
 */
export const getToken = (): string | null => {
  if (typeof window === "undefined") return null

  // Try to get from cookie first
  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop()?.split(";").shift()
    return null
  }

  const cookieToken = getCookie("token")

  // Fallback to localStorage for backward compatibility
  const localToken = localStorage.getItem("token")

  return cookieToken || localToken
}

/**
 * Set the authentication token in both cookie and localStorage
 */
export const setToken = (token: string): void => {
  if (typeof window === "undefined") return

  // Set in localStorage for backward compatibility
  localStorage.setItem("token", token)

  // Set as cookie for middleware to detect
  document.cookie = `token=${token}; path=/; max-age=2592000; SameSite=Strict` // 30 days
}

/**
 * Remove the authentication token from both cookie and localStorage
 */
export const removeToken = (): void => {
  if (typeof window === "undefined") return

  // Remove from localStorage
  localStorage.removeItem("token")
  localStorage.removeItem("user")

  // Clear cookie
  document.cookie = "token=; path=/; max-age=0"
}

/**
 * Check if the user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!getToken()
}

/**
 * Get the user data from localStorage
 */
export const getUser = () => {
  if (typeof window === "undefined") return null
  const userStr = localStorage.getItem("user")
  if (!userStr) return null

  try {
    return JSON.parse(userStr)
  } catch (error) {
    console.error("Error parsing user data:", error)
    return null
  }
}

/**
 * Check if the user has admin role
 */
export const isAdmin = (): boolean => {
  const user = getUser()
  return user?.role === "admin"
}

/**
 * Check if the user has manager (sous admin) role
 */
export const isManager = (): boolean => {
  const user = getUser()
  return user?.role === "sous admin" || user?.role === "admin"
}

/**
 * Check if user has permission based on required role
 */
export const hasPermission = (requiredRole: string | string[]): boolean => {
  const user = getUser()
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

/**
 * Get authorization header for API requests
 */
export const getAuthHeader = () => {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/**
 * Get user ID from JWT token
 */
export const getUserIdFromToken = (): string | null => {
  const token = getToken()
  if (!token) return null

  try {
    // JWT tokens are in the format: header.payload.signature
    const payload = token.split(".")[1]
    // Decode the base64 payload
    const decodedPayload = JSON.parse(atob(payload))
    // Return the user ID (assuming your token has a 'userId' or 'sub' field)
    return decodedPayload.userId || decodedPayload.sub || null
  } catch (error) {
    console.error("Error decoding JWT token:", error)
    return null
  }
}

/**
 * Safely parse JWT token without throwing errors
 */
export const parseJwt = (token: string) => {
  try {
    const base64Url = token.split(".")[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    )
    return JSON.parse(jsonPayload)
  } catch (e) {
    console.error("Error parsing JWT", e)
    return null
  }
}

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  const parsedToken = parseJwt(token)
  if (!parsedToken || !parsedToken.exp) return true

  // exp is in seconds, Date.now() is in milliseconds
  return parsedToken.exp * 1000 < Date.now()
}
