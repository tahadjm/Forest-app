import apiClient from "@/lib/api-client"

// Types
export interface AuthResponse {
  success: boolean
  message?: string
  user?: User
  token?: string
}

export interface User {
  id: string
  username: string
  email: string
  role: "user" | "admin" | "park_owner"
  createdAt: string
  updatedAt: string
}

export const AuthService = {
  // Login
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post("/auth/signin", {
        email,
        password,
      })

      if (response.data.success && response.data.token) {
        localStorage.setItem("authToken", response.data.token)
      }

      return response.data
    } catch (error: any) {
      if (error.response) {
        return error.response.data
      }
      return { success: false, message: "Network error. Please try again later." }
    }
  },

  // Register
  register: async (username: string, email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post("/auth/register", {
        username,
        email,
        password,
      })

      if (response.data.success && response.data.token) {
        localStorage.setItem("authToken", response.data.token)
      }

      return response.data
    } catch (error: any) {
      if (error.response) {
        return error.response.data
      }
      return { success: false, message: "Network error. Please try again later." }
    }
  },

  // Get current user
  getCurrentUser: async (): Promise<AuthResponse> => {
    try {
      const response = await apiClient.get("/auth/profile")
      return response.data
    } catch (error: any) {
      if (error.response) {
        return error.response.data
      }
      return { success: false, message: "Network error. Please try again later." }
    }
  },

  // Get user role
  getUserRole: async (): Promise<string | null> => {
    try {
      const response = await apiClient.get("/auth/getrole")
      return response.data.userRole
    } catch (error) {
      console.error("Error getting user role:", error)
      return null
    }
  },

  // Set user role
  setRole: async (userId: string, role: string, parkId?: string): Promise<any> => {
    try {
      // Use a more reliable approach with body parameters instead of query params
      const response = await apiClient.patch(`/auth/setrole/${userId}`, {
        role,
        parkId: parkId || undefined,
      })
      return response.data
    } catch (error) {
      console.error("Error setting user role:", error)
      throw error
    }
  },

  updateUserField: async (userId: string, fieldName: string, value: string): Promise<any> => {
    try {
      const response = await apiClient.patch(`/auth/user/update-field/`, {
        field: fieldName,
        value: value,
      })
      return response.data
    } catch (error) {
      console.error(`Error updating user ${fieldName}:`, error)
      throw error
    }
  },

  // Get users
  getUsers: async (userId?: string): Promise<any> => {
    try {
      const response = await apiClient.get("/auth/users", {
        params: userId ? { userId } : undefined,
      })
      return response.data
    } catch (error) {
      console.error("Error getting users:", error)
      throw error
    }
  },

  // Sign out
  signOut: async (): Promise<void> => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("token")
    try {
      await apiClient.post("/auth/signout")
    } catch (error) {
      console.error("Error during sign out:", error)
    }
  },

  // Reset password
  resetPassword: async (email: string): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post("/auth/reset-password", { email })
      return response.data
    } catch (error: any) {
      if (error.response) {
        return error.response.data
      }
      return { success: false, message: "Network error. Please try again later." }
    }
  },

  // Update password
  updatePassword: async (token: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post("/auth/update-password", { token, password })
      return response.data
    } catch (error: any) {
      if (error.response) {
        return error.response.data
      }
      return { success: false, message: "Network error. Please try again later." }
    }
  },

  // Check auth status
  checkAuthStatus: async (): Promise<boolean> => {
    try {
      const response = await AuthService.getCurrentUser()
      return response.success === true
    } catch (error) {
      return false
    }
  },

  // Update user profile
  updateProfile: async (userData: Partial<User>): Promise<AuthResponse> => {
    try {
      const response = await apiClient.put("/auth/profile", userData)
      return response.data
    } catch (error: any) {
      if (error.response) {
        return error.response.data
      }
      return { success: false, message: "Network error. Please try again later." }
    }
  },

  // Update user - Fixed to use the correct endpoint
  updateUser: async (userId: string, email: string, username: string): Promise<any> => {
    try {
      // Using the user/update-field endpoint which we know exists based on other methods
      const emailResponse = await AuthService.updateUserField(userId, "email", email)
      const usernameResponse = await AuthService.updateUserField(userId, "username", username)

      // Check if both updates were successful
      if (emailResponse.success && usernameResponse.success) {
        return { success: true, message: "User updated successfully" }
      } else {
        return {
          success: false,
          message: "Failed to update user information",
        }
      }
    } catch (error) {
      console.error("Error updating user:", error)
      throw error
    }
  },
}

export default AuthService
