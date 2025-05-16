import apiClient from "@/lib/api-client"

export interface Pricing {
  _id: string
  parkId: string
  type: "parcours" | "activity"
  relatedId: string[]
  name: string
  description: string
  image?: string
  price: number
  additionalCharge: number
}

export const PricingService = {
  // Get all pricing entries for a park
  getAllPricing: async (parkId: string) => {
    try {
      const response = await apiClient.get(`/pricing/${parkId}`)
      return response.data
    } catch (error) {
      console.error("Error fetching pricing:", error)
      throw error
    }
  },

  // Get pricing by date
  getPricingByDate: async (parkId: string, date: string) => {
    try {
      const response = await apiClient.get(`/pricing/day/${parkId}`, { params: { date } })
      return response.data
    } catch (error) {
      console.error("Error fetching pricing by date:", error)
      throw error
    }
  },

  // Get a specific pricing entry
  getPricingById: async (parkId: string, pricingId: string) => {
    try {
      const response = await apiClient.get(`/pricing/${pricingId}/${parkId}`)
      console.log(`fetching:${parkId}/${pricingId}`)
      return response.data
    } catch (error) {
      console.error("Error fetching pricing by ID:", error)
      throw error
    }
  },

  // Add a new pricing entry
  addPricing: async (parkId: string, pricingData: Omit<Pricing, "_id">) => {
    try {
      const response = await apiClient.post(`/pricing/${parkId}`, pricingData)
      return response.data
    } catch (error) {
      console.error("Error adding pricing:", error)
      throw error
    }
  },

  // Update a pricing entry
  updatePricing: async (parkId: string, pricingId: string, pricingData: Partial<Pricing>) => {
    try {
      const response = await apiClient.put(`/pricing/${parkId}/${pricingId}`, pricingData)
      return response.data
    } catch (error) {
      console.error("Error updating pricing:", error)
      throw error
    }
  },

  // Delete a pricing entry
  deletePricing: async (parkId: string, pricingId: string) => {
    try {
      const response = await apiClient.delete(`/pricing/${parkId}/${pricingId}`)
      return response.data
    } catch (error) {
      console.error("Error deleting pricing:", error)
      throw error
    }
  },

  // Delete all prices for a park
  deleteAllPrices: async (parkId: string) => {
    try {
      const response = await apiClient.delete(`/pricing/delete/${parkId}/delete-all-prices`)
      return response.data
    } catch (error) {
      console.error("Error deleting all prices:", error)
      throw error
    }
  },
}

export default PricingService
