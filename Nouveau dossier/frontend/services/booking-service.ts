import apiClient from "@/lib/api-client"

// Define types for the booking data
export interface Booking {
  _id?: string
  userId: string
  parkId: string
  activityId?: string
  date: string
  time: string
  numberOfPeople: number
  status: "pending" | "confirmed" | "cancelled" | "completed"
  totalPrice: number
  paymentStatus?: "pending" | "paid" | "refunded"
  specialRequests?: string
  createdAt?: string
  updatedAt?: string
}

export interface BookingCreateData {
  userId?: string // Optional as it might be derived from auth token
  parkId: string
  activityId?: string
  date: string
  time: string
  numberOfPeople: number
  specialRequests?: string
}

export interface BookingStatusUpdateData {
  status: "pending" | "confirmed" | "cancelled" | "completed"
  notes?: string
}

export const BookingService = {
  // Create a new booking
  createBooking: async (bookingData: BookingCreateData) => {
    try {
      const response = await apiClient.post("/booking", bookingData)
      return response.data
    } catch (error) {
      console.error("Error creating booking:", error)
      throw error
    }
  },
  markBookingAsUsed: async (bookingId: string) => {
    try {
      const response = await apiClient.put(`/booking/${bookingId}/used`)
      return response.data
    } catch (error) {
      console.error("Error marking booking as used:", error)
      throw error
    }
  },
  // Get all bookings (admin only)
  getAllBookings: async () => {
    try {
      const response = await apiClient.get("/booking")
      return response.data
    } catch (error) {
      console.error("Error fetching all bookings:", error)
      throw error
    }
  },

  // Get bookings for the current user
  getCurrentUserBookings: async () => {
    try {
      const response = await apiClient.get("/booking/user")
      console.log("Current user bookings:", response.data)
      return response.data
    } catch (error) {
      console.error("Error fetching current user bookings:", error)
      throw error
    }
  },

  // Get bookings by park ID
  getBookingsByParkId: async (parkId: string) => {
    try {
      const response = await apiClient.get(`/booking/pakrs/${parkId}`)
      return response.data
    } catch (error) {
      console.error("Error fetching bookings by park ID:", error)
      throw error
    }
  },

  // Get a booking by ID
  getBookingById: async (bookingId: string) => {
    try {
      const response = await apiClient.get(`/booking/${bookingId}`)
      return response.data
    } catch (error) {
      console.error("Error fetching booking by ID:", error)
      throw error
    }
  },

  // Get QR code by booking ID
  getQrCodeByBookingId: async (bookingId: string) => {
    try {
      const response = await apiClient.get(`/booking/qr/${bookingId}`)
      return response.data
    } catch (error) {
      console.error("Error fetching QR code for booking:", error)
      throw error
    }
  },

  // Update booking status (admin only)
  updateBookingStatus: async (bookingId: string, statusData: BookingStatusUpdateData) => {
    try {
      const response = await apiClient.put(`/booking/${bookingId}/status`, statusData)
      return response.data
    } catch (error) {
      console.error("Error updating booking status:", error)
      throw error
    }
  },

  // Cancel a booking (user or admin)
  cancelBooking: async (bookingId: string) => {
    try {
      const response = await apiClient.put(`/booking/${bookingId}/cancel`, {})
      return response.data
    } catch (error) {
      console.error("Error canceling booking:", error)
      throw error
    }
  },

  // Delete a booking (admin only)
  deleteBooking: async (bookingId: string) => {
    try {
      const response = await apiClient.delete(`/booking/${bookingId}/admin`)
      return response.data
    } catch (error) {
      console.error("Error deleting booking:", error)
      throw error
    }
  },

  // Update a booking (user or admin)
  updateBooking: async (bookingId: string, bookingData: Partial<Booking>) => {
    try {
      const response = await apiClient.put(`/booking/${bookingId}`, bookingData)
      return response.data
    } catch (error) {
      console.error("Error updating booking:", error)
      throw error
    }
  },
}

export default BookingService
