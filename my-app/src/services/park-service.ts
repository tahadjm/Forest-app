import apiClient from "@/lib/api-client"

// Define the park form values type
export interface ParkFormValues {
  name: string
  location: string
  description: string
  maxBookingDays: number
  imageUrl?: string
  workingHours: Record<string, any>
}

// Sample data to use as fallback when API is unavailable
const SAMPLE_PARKS = [
  {
    _id: "sample1",
    name: "Adventure Forest Park",
    description: "Experience thrilling adventures in our forest park with various activities for all ages.",
    location: "123 Forest Avenue",
    imageUrl: "/placeholder-park-1.jpg",
    maxBookingDays: 7,
  },
  {
    _id: "sample2",
    name: "Mountain Explorer Park",
    description: "Discover the beauty of nature with our mountain trails and exciting outdoor activities.",
    location: "456 Mountain Road",
    imageUrl: "/placeholder-park-2.jpg",
    maxBookingDays: 5,
  },
  {
    _id: "sample3",
    name: "Riverside Adventure Park",
    description: "Enjoy water activities and forest adventures along our beautiful riverside park.",
    location: "789 River Lane",
    imageUrl: "/placeholder-park-3.jpg",
    maxBookingDays: 3,
  },
]

export const ParkService = {
  // Create a park - handles FormData
  createPark: async (data: ParkFormValues | FormData) => {
    try {
      const response = await apiClient.post("/parks", data, {
        headers: {
          // Don't set Content-Type when sending FormData
          // Axios will automatically set the correct Content-Type with boundary
          ...(data instanceof FormData ? {} : { "Content-Type": "application/json" }),
        },
      })
      return response.data
    } catch (error) {
      console.error("Error creating park:", error)
      throw error
    }
  },

  isDayClosed: async (parkId: string, day: number) => {
    try {
      const response = await apiClient.get(`/parks/${parkId}/isClosed?day=${day}`)
      return response.data.closed
    } catch (error) {
      console.error("Error getting park:", error)
      throw error
    }
  },

  // Update a park - handles FormData
  updatePark: async (id: string, data: any) => {
    try {
      const response = await apiClient.put(`/parks/${id}`, data, {
        headers: {
          ...(data instanceof FormData ? {} : { "Content-Type": "application/json" }),
        },
      })
      return response.data
    } catch (error) {
      console.error("Error updating park:", error)
      throw error
    }
  },

  // Get all parks - with retry logic and fallback data
  getAllParks: async (useFallback = false) => {
    // If explicitly asked to use fallback data
    if (useFallback) {
      console.log("Using fallback park data")
      return { data: SAMPLE_PARKS }
    }

    // Try to fetch from API with retry logic
    let retries = 2
    let lastError = null

    while (retries >= 0) {
      try {
        const response = await apiClient.get("/parks")
        return response.data
      } catch (error) {
        lastError = error
        retries--
        if (retries >= 0) {
          console.log(`Retrying API request, ${retries + 1} attempts remaining`)
          await new Promise((resolve) => setTimeout(resolve, 1000)) // Wait 1 second before retry
        }
      }
    }

    // If all retries failed and we have a fallback
    console.warn("API request failed after retries, using fallback data")
    return { data: SAMPLE_PARKS, isOffline: true }
  },

  // Get a park by ID - with fallback
  getParkById: async (id: string) => {
    try {
      const response = await apiClient.get(`/parks/${id}`)
      return response.data
    } catch (error: any) {
      // If network error or 404, check if we have a matching sample park
      if (error.code === "ECONNABORTED" || !error.response || error.response.status === 404) {
        const samplePark = SAMPLE_PARKS.find((park) => park._id === id)
        if (samplePark) {
          console.log("Using fallback park data for ID:", id)
          return { data: samplePark, isOffline: true }
        }
      }

      console.error("Error getting park by ID:", error)
      throw error
    }
  },

  // Get park for current user
  getParkForCurrentUser: async () => {
    try {
      const response = await apiClient.get("/parks/user")

      return response.data
    } catch (error: any) {
      // If network error, return empty result instead of throwing
      if (error.code === "ECONNABORTED" || !error.response) {
        console.warn("Network error when fetching user park, returning empty result")
        return { data: null, isOffline: true }
      }

      console.error("Error getting park for current user:", error)
      throw error
    }
  },

  // Delete a park
  deletePark: async (id: string) => {
    try {
      const response = await apiClient.delete(`/parks/${id}`)
      return response.data
    } catch (error) {
      console.error("Error deleting park:", error)
      throw error
    }
  },

  // Upload park image
  uploadParkImage: async (id: string, imageFile: File) => {
    try {
      const formData = new FormData()
      // Use 'image' as the field name - this should match your Multer configuration
      formData.append("image", imageFile)
      formData.append("id", id)

      const response = await apiClient.post("/parks/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      return response.data
    } catch (error) {
      console.error("Error uploading park image:", error)
      throw error
    }
  },

  // Get working hours for a park on a specific date
  getWorkingHours: async (parkId: string, date?: string) => {
    try {
      const url = date ? `/parks/${parkId}/working-hours?date=${date}` : `/parks/${parkId}/working-hours`

      const response = await apiClient.get(url)
      return response.data.workingHours
    } catch (error) {
      console.error(`Error fetching working hours for ${date || "all days"}:`, error)
      return null
    }
  },

  // Get working hours for multiple dates
  getWorkingHoursForDates: async (parkId: string, dates: string[]) => {
    try {
      const promises = dates.map((date) => apiClient.get(`/parks/${parkId}/working-hours/${date}`))
      const responses = await Promise.all(promises)

      // Create a map of date to working hours
      const workingHoursMap: Record<string, any> = {}
      responses.forEach((response, index) => {
        workingHoursMap[dates[index]] = response.data.workingHours
      })

      return workingHoursMap
    } catch (error) {
      console.error(`Error fetching working hours for multiple dates:`, error)
      throw error
    }
  },
}

export default ParkService
