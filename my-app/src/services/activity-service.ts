import apiClient from "@/lib/api-client"
import type { Activity } from "@/types/activity"

export const ActivityService = {
  // Add a new activity
  addNewActivity: async (parkId: string, activityData: Activity) => {
    try {
      const response = await apiClient.post(`/activity/${parkId}`, activityData)
      return response.data
    } catch (error) {
      console.error("Error adding activity:", error)
      throw error
    }
  },

  // Get activities by parkId
  getActivitiesByParkId: async (parkId: string) => {
    try {
      console.log(`Fetching activities for park: ${parkId}`)
      const response = await apiClient.get(`/activity/${parkId}`)
      return response.data
    } catch (error) {
      console.error("Error fetching activities by park ID:", error)
      throw error
    }
  },

  // Get all activities
  getAllActivities: async () => {
    try {
      const response = await apiClient.get("/activity")
      return response.data
    } catch (error) {
      console.error("Error fetching all activities:", error)
      throw error
    }
  },

  // Get activity by ID
  getActivityById: async (activityId: string) => {
    try {
      const response = await apiClient.get(`/activity/${activityId}/get-by-activityId`)
      return response.data
    } catch (error) {
      console.error("Error fetching activity by ID:", error)
      throw error
    }
  },

  // Update activity
  updateActivity: async (activityId: string, updatedData: Partial<Activity>) => {
    try {
      const response = await apiClient.put(`/activity/${activityId}`, updatedData)
      return response.data
    } catch (error) {
      console.error("Error updating activity:", error)
      throw error
    }
  },

  // Delete activity
  deleteActivity: async (activityId: string) => {
    try {
      const response = await apiClient.delete(`/activity/${activityId}`)
      return response.data
    } catch (error) {
      console.error("Error deleting activity:", error)
      throw error
    }
  },
}

export default ActivityService
