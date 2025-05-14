import axios from "axios"
import { getToken, removeToken } from "@/utils/auth"

// Create axios instance with base URL
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add request interceptor to add auth token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add response interceptor to handle auth errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Clear token if it's expired or invalid
      removeToken()

      // Redirect to login page if we're in a browser environment
      if (typeof window !== "undefined") {
        // Store the current path to redirect back after login
        const currentPath = window.location.pathname
        window.location.href = `/?auth=login&callbackUrl=${encodeURIComponent(currentPath)}`
      }
    }
    return Promise.reject(error)
  },
)

export default axiosInstance
