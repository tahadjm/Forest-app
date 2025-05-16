import TimeSlot from "../models/TimeSlot.js";
import Park from "../models/ParkShcema.js";
import mongoose from "mongoose";
import axios from "axios";

// Reuse timeToMinutes for consistency
const timeToMinutes = (time) => {
  if (!time || typeof time !== "string" || !time.match(/^\d{2}:\d{2}$/)) {
    throw new Error(`Invalid time format: ${time}`);
  }
  const [hours, minutes] = time.split(":").map(Number);
  if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new Error(`Invalid time value: ${time}`);
  }
  return hours === 0 && minutes === 0 ? 1439 : hours * 60 + minutes;
};

export const getWorkingHours = async (parkId, date) => {
  try {
    const response = await axios.get(`http://localhost:8000/api/parks/${parkId}/working-hours/${date}`);
    return response.data.workingHours;
  } catch (error) {
    console.error(`Error fetching working hours for ${date}:`, error.response?.data || error.message);
    return null;
  }
};

export const autoFillTimeSlots = async (parkId, date) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(parkId)) {
      throw new Error("Invalid park ID");
    }

    const park = await Park.findById(parkId);
    if (!park) {
      throw new Error("Park not found");
    }

    const workingHours = await getWorkingHours(parkId, date);
    if (!workingHours || workingHours.closed) {
      console.log(`Skipping auto-fill for ${date}, park is closed.`);
      return;
    }

    const openMinutes = timeToMinutes(workingHours.from);
    const closeMinutes = timeToMinutes(workingHours.to);
    let currentMinutes = openMinutes;

    const existingSlots = await TimeSlot.find({ parkId, startDate: date });

    while (currentMinutes < closeMinutes) {
      const startSlot = currentMinutes;
      const endSlot = Math.min(currentMinutes + 120, closeMinutes);

      const startTime = `${String(Math.floor(startSlot / 60)).padStart(2, "0")}:${String(startSlot % 60).padStart(2, "0")}`;
      const endTime = `${String(Math.floor(endSlot / 60)).padStart(2, "0")}:${String(endSlot % 60).padStart(2, "0")}`;

      if (!existingSlots.some((slot) => slot.startTime === startTime && slot.endTime === endTime)) {
        const baseSlot = new TimeSlot({
          parkId,
          pricingIds: [],
          startDate: date,
          endDate: date,
          startTime,
          endTime,
          ticketLimit: 20,
          availableTickets: 20,
          priceAdjustment: 0,
        });

        await baseSlot.save();
      }

      currentMinutes = endSlot;
    }
  } catch (error) {
    console.error(`Error in autoFillTimeSlots for ${date}:`, error.message);
    throw new Error(`Failed to auto-fill time slots for ${date}`);
  }
};
