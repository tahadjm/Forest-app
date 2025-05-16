"use client"

import apiClient from "@/lib/api-client"

export interface TimeSlot {
  _id?: string
  parkId: string
  pricingIds: string[]
  date: string
  startTime: string
  endTime: string
  ticketLimit: number
  availableTickets: number
  availableSpots?: number
  priceAdjustment: number
  daysOfWeek: number[]
}

export const TimeSlotService = {
  // Get time slots for a specific park
  getTimeSlots: async (parkId: string) => {
    if (!parkId || typeof parkId !== "string") {
      throw new Error("Invalid parkId provided")
    }

    try {
      const response = await apiClient.get(`/timeslots/${parkId}`)
      return response.data || []
    } catch (error) {
      console.error("Error fetching time slots:", error)
      throw new Error("Failed to fetch time slots. Please try again later.")
    }
  },

  // Get time slots for a specific day and pricing
  getTimeSlotsByDayAndPricing: async (parkId: string, dayOfWeek?: number, pricingId?: string) => {
    if (!parkId || typeof parkId !== "string") {
      throw new Error("Invalid parkId provided")
    }

    if (dayOfWeek !== undefined && (dayOfWeek < 0 || dayOfWeek > 6)) {
      throw new Error("Invalid dayOfWeek provided (must be 0-6)")
    }

    if (pricingId && typeof pricingId !== "string") {
      throw new Error("Invalid pricingId provided")
    }

    try {
      const params: Record<string, any> = {}
      if (dayOfWeek !== undefined) params.dayOfWeek = dayOfWeek
      if (pricingId) params.pricingId = pricingId

      const response = await apiClient.get(`/timeslots/dayofweek/${parkId}`, { params })
      return response.data || []
    } catch (error) {
      console.error("Error fetching time slots by day and pricing:", error)
      throw new Error("Failed to fetch time slots. Please check your parameters and try again.")
    }
  },

  // Get time slot by Id
  getTimeSlotTemplateById: async (timeSlotId: string) => {
    if (!timeSlotId || typeof timeSlotId !== "string") {
      throw new Error("Invalid timeSlotId provided")
    }

    try {
      const response = await apiClient.get(`/timeslots/templates/id/${timeSlotId}`)
      return response.data || null
    } catch (error) {
      console.error("Error fetching time slot by ID:", error)
      throw new Error("Time slot not found. Please check the ID and try again.")
    }
  },

  // Add a new time slot
  addTimeSlot: async (timeSlotData: Omit<TimeSlot, "_id">) => {
    if (!timeSlotData || typeof timeSlotData !== "object") {
      throw new Error("Invalid time slot data provided")
    }

    if (!timeSlotData.parkId || typeof timeSlotData.parkId !== "string") {
      throw new Error("Invalid parkId in time slot data")
    }

    try {
      const response = await apiClient.post(`/timeslots/${timeSlotData.parkId}`, timeSlotData)
      return response.data || null
    } catch (error) {
      console.error("Error adding time slot:", error)
      throw new Error("Failed to add time slot. Please check your data and try again.")
    }
  },

  // Update a time slot
  updateTimeSlot: async (timeSlotId: string, timeSlotData: Partial<TimeSlot>) => {
    if (!timeSlotId || typeof timeSlotId !== "string") {
      throw new Error("Invalid timeSlotId provided")
    }

    if (!timeSlotData || typeof timeSlotData !== "object") {
      throw new Error("Invalid time slot data provided")
    }

    try {
      const response = await apiClient.put(`/timeslots/${timeSlotId}`, timeSlotData)
      return response.data || null
    } catch (error) {
      console.error("Error updating time slot:", error)
      throw new Error("Failed to update time slot. Please check your data and try again.")
    }
  },

  // Delete a time slot
  deleteTimeSlot: async (timeSlotId: string) => {
    if (!timeSlotId || typeof timeSlotId !== "string") {
      throw new Error("Invalid timeSlotId provided")
    }

    try {
      const response = await apiClient.delete(`/timeslots/${timeSlotId}`)
      return response.data || null
    } catch (error) {
      console.error("Error deleting time slot:", error)
      throw new Error("Failed to delete time slot. Please try again later.")
    }
  },

  // Auto-fill time slots based on working hours
  autoFillTimeSlots: async (
    parkId: string,
    data: {
      date: string
      daysOfWeek: number[]
      startTime: string
      endTime: string
      interval: number
      ticketLimit: number
    },
  ) => {
    if (!parkId || typeof parkId !== "string") {
      throw new Error("Invalid parkId provided")
    }

    if (!data || typeof data !== "object") {
      throw new Error("Invalid auto-fill data provided")
    }

    if (!data.date) {
      throw new Error("Date is required for auto-filling time slots")
    }

    if (!Array.isArray(data.daysOfWeek) || data.daysOfWeek.some((day) => day < 0 || day > 6)) {
      throw new Error("Invalid daysOfWeek provided (must be array of 0-6)")
    }

    try {
      const response = await apiClient.post(`/timeslots/${parkId}/auto-fill-slots`, data)
      return response.data || []
    } catch (error) {
      console.error("Error auto-filling time slots:", error)
      throw new Error("Failed to auto-fill time slots. Please check your parameters and try again.")
    }
  },

  // Get time slots with pricing for a park
  getTimeSlotsWithPricing: async (parkId: string, date?: string, pricingId?: string) => {
    if (!parkId || typeof parkId !== "string") {
      throw new Error("Invalid parkId provided")
    }

    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error("Invalid date format. Please use YYYY-MM-DD format.")
    }

    if (pricingId && typeof pricingId !== "string") {
      throw new Error("Invalid pricingId provided")
    }

    try {
      const params: Record<string, string> = {}
      if (date) params.date = date
      if (pricingId) params.pricingId = pricingId

      const response = await apiClient.get(`/timeslots/${parkId}`, { params })
      return response.data || []
    } catch (error) {
      console.error("Error fetching time slots with pricing:", error)
      throw new Error("Failed to fetch time slots. Please check your parameters and try again.")
    }
  },

  // Check for overlapping time slots without creating them
  checkOverlappingTimeSlots: async (
    parkId: string,
    date: string,
    startTime: string,
    endTime: string,
    daysOfWeek: number[],
    pricingIds: string[],
  ) => {
    if (!parkId || typeof parkId !== "string") {
      throw new Error("Invalid parkId provided")
    }

    if (!date) {
      throw new Error("Date is required")
    }

    if (!startTime || !endTime) {
      throw new Error("Both startTime and endTime are required")
    }

    if (!Array.isArray(daysOfWeek) || daysOfWeek.some((day) => day < 0 || day > 6)) {
      throw new Error("Invalid daysOfWeek provided (must be array of 0-6)")
    }

    if (!Array.isArray(pricingIds) || pricingIds.some((id) => typeof id !== "string")) {
      throw new Error("Invalid pricingIds provided (must be array of strings)")
    }

    try {
      const response = await apiClient.get(`/timeslots/${parkId}/check-overlap`, {
        params: {
          date,
          startTime,
          endTime,
          daysOfWeek: JSON.stringify(daysOfWeek),
          pricingIds: JSON.stringify(pricingIds),
        },
      })

      // If we get slots back, there might be overlaps
      return (response.data || []).length > 0
    } catch (error) {
      console.error("Error checking for overlapping time slots:", error)
      throw new Error("Failed to check for overlapping time slots. Please try again later.")
    }
  },

  // Get time slot templates
  getTimeSlotTemplates: async (parkId: string, params?: Record<string, string>) => {
    try {
      const queryParams = new URLSearchParams()

      // Add any additional query parameters
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value) queryParams.append(key, value)
        })
      }

      const response = await apiClient.get(`/timeslots/templates/${parkId}?${queryParams.toString()}`)
      return response.data
    } catch (error) {
      console.error("Error fetching time slot templates:", error)
      throw error
    }
  },

  // Create a new time slot template
  createTimeSlotTemplate: async (parkId: string, templateData: any) => {
    try {
      const response = await apiClient.post(`/timeslots/parks/${parkId}/templates`, templateData)
      return response.data
    } catch (error) {
      console.error("Error creating time slot template:", error)
      throw error
    }
  },

  // Update a time slot template
  updateTimeSlotTemplate: async (templateId: string, templateData: any) => {
    try {
      const response = await apiClient.put(`/timeslots/templates/${templateId}`, templateData)
      return response.data
    } catch (error) {
      console.error("Error updating time slot template:", error)
      throw error
    }
  },

  // Delete a time slot template
  deleteTimeSlotTemplate: async (templateId: string) => {
    try {
      const response = await apiClient.delete(`/timeslots/templates/${templateId}`)
      return response.data
    } catch (error) {
      console.error("Error deleting time slot template:", error)
      throw error
    }
  },

  // Get time slot instances for a specific date
  getTimeSlotInstances: async (parkId: string, date: string, pricingId?: string) => {
    try {
      let url = `/timeslots/instances?parkId=${parkId}&date=${date}`
      if (pricingId) {
        url += `&pricingId=${pricingId}`
      }
      const response = await apiClient.get(url)
      return response.data
    } catch (error) {
      console.error("Error fetching time slot instances:", error)
      throw error
    }
  },

  // Get a specific time slot instance
  getTimeSlotInstanceById: async (instanceId: string) => {
    try {
      const response = await apiClient.get(`/timeslots/instances/?instanceId=${instanceId}`)
      return response.data
    } catch (error) {
      console.error("Error fetching time slot instance:", error)
      throw error
    }
  },
  //Update Instance
  updateTimeSlotInstance: async (instanceId: string, instanceData: any) => {
    try {
      const response = await apiClient.put(`/timeslots/instances/${instanceId}`, instanceData)
      return response.data
    } catch (error) {
      console.error("Error updating time slot instance:", error)
      throw error
    }
  },

  // Check for overlapping templates
  checkOverlappingTemplates: async (
    parkId: string,
    validFrom: string,
    validUntil: string,
    startTime: string,
    endTime: string,
    daysOfWeek: number[],
    pricingIds: string[],
  ) => {
    try {
      const response = await apiClient.post("/timeslots/templates/check-overlap", {
        parkId,
        validFrom,
        validUntil,
        startTime,
        endTime,
        daysOfWeek,
        pricingIds,
      })
      return response.data.hasOverlap
    } catch (error) {
      console.error("Error checking for overlapping templates:", error)
      throw error
    }
  },
}

export default TimeSlotService
