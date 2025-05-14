import mongoose from "mongoose"

/**
 * Migration script to convert date-specific time slots to day-of-week time slots
 * Run this after updating the TimeSlot schema
 */
export const migrateTimeSlots = async () => {
  try {
    console.log("Starting time slot migration...")

    // Get all existing time slots
    const oldTimeSlots = await mongoose.connection.db.collection("timeslots").find({}).toArray()
    console.log(`Found ${oldTimeSlots.length} time slots to migrate`)

    // Group time slots by parkId, startTime, endTime, and pricingIds
    const groupedSlots = {}

    for (const slot of oldTimeSlots) {
      // Skip slots that don't have dates
      if (!slot.startDate) continue

      // Calculate day of week from startDate
      const dayOfWeek = new Date(slot.startDate).getDay()

      // Create a key for grouping similar slots
      const pricingKey = Array.isArray(slot.pricingIds)
        ? slot.pricingIds.sort().join(",")
        : String(slot.pricingIds || "")

      const key = `${slot.parkId}-${slot.startTime}-${slot.endTime}-${pricingKey}`

      if (!groupedSlots[key]) {
        groupedSlots[key] = {
          parkId: slot.parkId,
          pricingIds: slot.pricingIds,
          startTime: slot.startTime,
          endTime: slot.endTime,
          ticketLimit: slot.ticketLimit,
          availableTickets: slot.availableTickets,
          priceAdjustment: slot.priceAdjustment || 0,
          daysOfWeek: [],
        }
      }

      // Add this day of week if not already included
      if (!groupedSlots[key].daysOfWeek.includes(dayOfWeek)) {
        groupedSlots[key].daysOfWeek.push(dayOfWeek)
      }
    }

    // Create new time slots with days of week
    const newTimeSlots = Object.values(groupedSlots)
    console.log(`Created ${newTimeSlots.length} consolidated time slots`)

    // Clear existing collection
    await mongoose.connection.db.collection("timeslots").deleteMany({})
    console.log("Cleared existing time slots")

    // Insert new time slots
    if (newTimeSlots.length > 0) {
      await mongoose.connection.db.collection("timeslots").insertMany(newTimeSlots)
      console.log("Inserted new time slots with days of week")
    }

    console.log("Migration completed successfully")
    return { success: true, message: "Migration completed successfully" }
  } catch (error) {
    console.error("Migration failed:", error)
    return { success: false, error: error.message }
  }
}

