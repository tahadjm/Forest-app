import apiClient from "@/lib/api-client"

export interface ChargilyCheckoutResponse {
  id: string
  checkout_url: string
  amount: number
  currency: string
  status: string
  success_url: string
}

export interface BookingStatus {
  _id: string
  status: "pending" | "confirmed" | "cancelled"
  paymentStatus: "pending" | "paid" | "failed"
  pricing: {
    name: string
    price: number
  }
  QrCode: string
  TicketCode: string
  date: string
  quantity: number
  totalPrice: number
  paymentId: string
}

// Store the last payment ID in sessionStorage (cleared when browser is closed)
const storeLastPaymentId = (id: string) => {
  if (typeof window !== "undefined") {
    sessionStorage.setItem("lastPaymentId", id)
  }
}

const getLastPaymentId = (): string | null => {
  if (typeof window !== "undefined") {
    return sessionStorage.getItem("lastPaymentId")
  }
  return null
}

const clearLastPaymentId = () => {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("lastPaymentId")
  }
}

// Store the token in sessionStorage before redirecting to payment gateway
const storeAuthToken = () => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("authToken") || localStorage.getItem("token")
    if (token) {
      sessionStorage.setItem("paymentAuthToken", token)
    }
  }
}

// Retrieve the token after returning from payment gateway
const retrieveAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return sessionStorage.getItem("paymentAuthToken")
  }
  return null
}

// Clear the stored auth token
const clearAuthToken = () => {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("paymentAuthToken")
  }
}

export const PaymentService = {
  // Create a checkout session
  createCheckout: async (): Promise<ChargilyCheckoutResponse> => {
    try {
      // Store the auth token before redirecting
      storeAuthToken()

      // Call your backend checkout endpoint
      const response = await apiClient.post("/payments/create-checkout")

      // Store payment ID for reference
      if (response.data.id) {
        storeLastPaymentId(response.data.id)
      }

      return response.data
    } catch (error) {
      console.error("Payment checkout error:", error)
      throw error
    }
  },

  // Get bookings by payment ID
  getBookingsByPaymentId: async (paymentId: string): Promise<BookingStatus[]> => {
    try {
      // Try to get token from session storage first (for after redirect)
      const sessionToken = retrieveAuthToken()

      // If we have a session token, use it for this request
      if (sessionToken) {
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${sessionToken}`
      }

      // Call your backend to get bookings by payment ID
      const response = await apiClient.get(`/booking/by-payment/${paymentId}`)

      // Clear the session token after successful use
      clearAuthToken()

      // Reset the authorization header if we used a session token
      if (sessionToken) {
        delete apiClient.defaults.headers.common["Authorization"]
      }

      return response.data.booking || []
    } catch (error) {
      console.error("Get bookings error:", error)
      throw error
    }
  },

  // Get the last payment ID
  getLastPaymentId: (): string | null => {
    return getLastPaymentId()
  },

  // Clear the last payment ID
  clearLastPaymentId: (): void => {
    clearLastPaymentId()
  },

  // Extract payment ID from URL
  extractPaymentIdFromUrl: (url: string): string | null => {
    // Check for checkout_id parameter
    const checkoutIdMatch = url.match(/[?&]checkout_id=([^&]+)/)
    if (checkoutIdMatch && checkoutIdMatch[1]) {
      return checkoutIdMatch[1]
    }

    // Chargily success URL format: https://pay.chargily.dz/test/payments/success/PAYMENT_ID?expires=XXX&signature=XXX
    if (url.includes("/success/")) {
      const paymentIdMatch = url.match(/\/success\/([^?]+)/)
      if (paymentIdMatch && paymentIdMatch[1]) {
        return paymentIdMatch[1]
      }
    }
    return null
  },
}

export default PaymentService
