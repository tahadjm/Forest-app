import apiClient from "@/lib/api-client"

// Define types based on the Joi schema
export interface SubParcours {
  id?: string
  name: string
  description: string
  image: string
  numberOfWorkshops: number | string
  tyroliennes: number | string
}

export interface Difficulty {
  level: "easy" | "medium" | "hard"
  description: string
}

export interface Parcours {
  id?: string
  parkId: string
  name: string
  difficulty: Difficulty
  ageRequirement: string
  heightRequirement?: string
  duration?: string
  description?: string
  subParcours: SubParcours[]
}

export const ParcoursService = {
  // Get all parcours for a specific park
  getByParkId: async (parkId: string) => {
    try {
      const response = await apiClient.get(`/parcours/${parkId}`)
      return response.data
    } catch (error) {
      console.error("Error fetching parcours:", error)
      throw error
    }
  },

  // Get a specific parcours by ID
  getById: async (parkId: string, parcoursId: string) => {
    try {
      const response = await apiClient.get(`/parcours/${parkId}/${parcoursId}`)
      return response.data
    } catch (error) {
      console.error("Error fetching parcours details:", error)
      throw error
    }
  },

  // Get a specific parcours by ID and park ID
  getParcoursByIdAndParkId: async (parcoursId: string, parkId: string) => {
    try {
      const response = await apiClient.get(`/parcours/${parkId}/${parcoursId}`)
      return response.data
    } catch (error) {
      console.error("Error fetching parcours details:", error)
      throw error
    }
  },

  // Add a new parcours
  add: async (parkId: string, parcoursData: Omit<Parcours, "id">) => {
    try {
      const response = await apiClient.post(`/parcours/${parkId}`, parcoursData)
      return response.data
    } catch (error) {
      console.error("Error adding parcours:", error)
      throw error
    }
  },

  // Update an existing parcours
  update: async (parkId: string, parcoursId: string, parcoursData: Partial<Parcours>) => {
    try {
      const response = await apiClient.put(`/parcours/${parkId}/${parcoursId}`, parcoursData)
      return response.data
    } catch (error) {
      console.error("Error updating parcours:", error)
      throw error
    }
  },

  // Delete a parcours
  remove: async (parkId: string, parcoursId: string) => {
    try {
      const response = await apiClient.delete(`/parcours/${parkId}/${parcoursId}`)
      return response.data
    } catch (error) {
      console.error("Error deleting parcours:", error)
      throw error
    }
  },

  // Add a sub-parcours to a parcours
  addSubParcours: async (parkId: string, parcoursId: string, subParcoursData: Omit<SubParcours, "id">) => {
    try {
      const response = await apiClient.post(`/parcours/${parkId}/${parcoursId}/subparcours`, subParcoursData)
      return response.data
    } catch (error) {
      console.error("Error adding sub-parcours:", error)
      throw error
    }
  },

  // Delete a sub-parcours
  removeSubParcours: async (parkId: string, parcoursId: string, subParcoursId: string) => {
    try {
      const response = await apiClient.delete(`/parcours/${parkId}/${parcoursId}/subparcours/${subParcoursId}`)
      return response.data
    } catch (error) {
      console.error("Error deleting sub-parcours:", error)
      throw error
    }
  },
}

export default ParcoursService
