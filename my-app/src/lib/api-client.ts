"use client"

import axios, { type AxiosError, type AxiosInstance, type AxiosRequestConfig } from "axios"

// Base API URL with environment variable fallback
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

// Create a configured axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 seconds
  withCredentials: true, // Important for cookies/auth sessions
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config) => {
    // Only add token in browser environment
    if (typeof window !== "undefined") {
      // Get token using the same method as in utils/auth.ts
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`
        const parts = value.split(`; ${name}=`)
        if (parts.length === 2) return parts.pop()?.split(";").shift()
        return null
      }

      // Try cookie first, then localStorage as fallback
      const token = getCookie("token") || localStorage.getItem("token") || localStorage.getItem("authToken")

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }

    // Log outgoing requests in development
    if (process.env.NODE_ENV === "development") {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`)
    }

    return config
  },
  (error) => Promise.reject(error),
)

// Response interceptor for consistent error handling
apiClient.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (process.env.NODE_ENV === "development") {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.status)
    }
    return response
  },
  (error: AxiosError) => {
    // Don't log 404 errors for the cart endpoint to reduce console noise
    const isCartEndpoint = error.config?.url?.includes("/cart")

    // Log the error for debugging (except for cart 404s which are expected when empty)
    if (!isCartEndpoint || error.response?.status !== 404) {
      console.error("API request failed:", {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        data: error.response?.data,
      })
    }

    // Handle specific error cases
    if (error.response?.status === 401) {
      // Handle unauthorized (could redirect to login or clear token)
      if (typeof window !== "undefined") {
        // Clear token on auth errors
        localStorage.removeItem("authToken")
        localStorage.removeItem("token")
      }
    }

    return Promise.reject(error)
  },
)

// Generic fetch function with typed response
export async function fetchApi<T>(endpoint: string, options: AxiosRequestConfig = {}): Promise<T> {
  try {
    const response = await apiClient(endpoint, options)
    return response.data
  } catch (error) {
    // Don't log 404 errors for the cart endpoint to reduce console noise
    const isCartEndpoint = endpoint.includes("/cart")
    if (!isCartEndpoint || (error as AxiosError).response?.status !== 404) {
      console.error(`API request error for ${endpoint}:`, error)
    }
    throw error
  }
}

// Export both the configured axios instance and the fetch function
export default apiClient
