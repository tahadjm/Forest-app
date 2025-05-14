import mongoose from "mongoose";
import dotenv from "dotenv";
import Park from "../models/ParkShcema.js";
import Activity from "../models/ActivitySchema.js"
import Pricing from "../models/Pricing.js";
import { pricingSchema } from "../middlewares/Validator.js";
import TimeSlot from "../models/TimeSlot.js";

dotenv.config();
const apiSecretKey = process.env.CHARGILY_API_KEY;

// ✅ Add Pricing
const addPricing = async (req, res) => {
  try {
    const { name, description, image, price, additionalCharge, relatedIds = [] } = req.body;
    const { parkId } = req.params;

    // Validate required fields
    const { error } = pricingSchema.validate({ name, description, image, price, additionalCharge });
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });

    // Validate parkId
    if (!mongoose.Types.ObjectId.isValid(parkId)) {
      return res.status(400).json({ success: false, message: "Invalid Park ID" });
    }

    // Check if the park exists
    const existingPark = await Park.findById(parkId);
    if (!existingPark) return res.status(404).json({ success: false, message: "Park not found" });

    // Ensure pricing doesn't already exist for this park and name
    const existingPricing = await Pricing.findOne({ parkId, name });
    if (existingPricing) {
      return res.status(400).json({ success: false, message: "Pricing already exists for this park" });
    }


    // Validate related activities or parcours
    let validRelatedIds = [];
    if (Array.isArray(relatedIds) && relatedIds.length > 0) {
      const relatedItems = await Activity.find({ _id: { $in: relatedIds } });

      if (relatedItems.length !== relatedIds.length) {
        return res.status(400).json({ success: false, message: "Some related items not found" });
      }

      // Ensure all belong to the same park
      const invalidItem = relatedItems.find(item => item.parkId.toString() !== parkId);
      if (invalidItem) {
        return res.status(400).json({
          success: false,
          message: `'${invalidItem.name}' does not belong to this park`
        });
      }

      validRelatedIds = relatedItems.map(item => item._id);
    }

    // Create new pricing entry
    const pricingEntry = new Pricing({
      parkId,
      name,
      description,
      image: image || null,
      price,
      additionalCharge: additionalCharge || 0,
      relatedId: validRelatedIds
    });

    await pricingEntry.save();
    return res.status(201).json({ success: true, message: "Pricing added successfully", pricing: pricingEntry });

  } catch (error) {
    console.error("Error adding pricing:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ✅ Delete Pricing
const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid or missing Product ID" });
    }

    const product = await Pricing.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // ✅ Delete from MongoDB
    await Pricing.findByIdAndDelete(productId);
    return res.status(200).json({ success: true, message: "Product deleted successfully" });

  } catch (error) {
    console.error("Error deleting product:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const updateFields = req.body; // Only provided fields will be updated

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid or missing Product ID" });
    }

    const product = await Pricing.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // ✅ Update in Chargily if relevant fields are changed
    const { name, description, price, image } = updateFields;

    // ✅ Update in MongoDB
    if (image) updateFields.image = image; // Handle image update
    const updatedProduct = await Pricing.findByIdAndUpdate(productId, updateFields, { new: true });

    return res.status(200).json({ success: true, message: "Product updated successfully", product: updatedProduct });

  } catch (error) {
    console.error("Error updating product:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ✅ Get Pricing by ID
const getPricingById = async (req, res) => {
  try {
    const { pricingId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(pricingId)) {
      return res.status(400).json({ success: false, message: "Invalid pricing ID" });
    }

    const pricing = await Pricing.findById(pricingId);
    if (!pricing) {
      return res.status(404).json({ success: false, message: "Pricing not found" });
    }

    return res.status(200).json({ success: true, pricing });
  } catch (error) {
    console.error("Error fetching pricing by ID:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getAllPricing = async (req, res) => {
  try {
    const { parkId } = req.params;

    // Validate parkId
    if (!mongoose.Types.ObjectId.isValid(parkId)) {
      return res.status(400).json({ success: false, message: "Invalid Park ID" });
    }

    // Fetch all pricing entries for the given park
    const pricing = await Pricing.find({ parkId });

    return res.status(200).json({ success: true, pricing });

  } catch (error) {
    console.error("Error fetching pricing:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ✅ Get Pricing by Date from Timeslot with Dynamic Times
const getPricingByDate = async (req, res) => {
  try {
    const { parkId, date, pricingId } = req.body;

    // Validate input
    if (!parkId || !mongoose.Types.ObjectId.isValid(parkId)) {
      return res.status(400).json({ success: false, message: "Invalid or missing Park ID" });
    }
    if (!date) {
      return res.status(400).json({ success: false, message: "Date is required" });
    }
    if (!pricingId || !mongoose.Types.ObjectId.isValid(pricingId)) {
      return res.status(400).json({ success: false, message: "Invalid or missing Pricing ID" });
    }

    // Convert date to start and end of the day (to match stored ISO date)
    const inputDate = new Date(date);
    const startOfDay = new Date(inputDate.setUTCHours(0, 0, 0, 0)); // Start of the given date
    const endOfDay = new Date(inputDate.setUTCHours(23, 59, 59, 999)); // End of the given date

    // Fetch park data to get its working hours (special periods and defaults)
    const park = await Park.findById(parkId);
    if (!park) {
      return res.status(404).json({ success: false, message: "Park not found" });
    }

    // Get full day hours for the given date
    const dayHours = await getFullDayHours(parkId, date);
    const { fullDayStart, fullDayEnd } = dayHours;

    console.log("Operating hours for the day:", fullDayStart, fullDayEnd);

    // Query TimeSlot model for pricing entries within the requested date and time range
    const timeSlots = await TimeSlot.find({
      parkId,
      pricingIds: { $in: [pricingId] }, // ✅ Ensures pricingId exists in the array
      startDate: { $lte: endOfDay },
      endDate: { $gte: startOfDay },
      startTime: { $gte: fullDayStart },
      endTime: { $lte: fullDayEnd },
    }).populate({
      path: "pricingIds",
      match: { _id: pricingId }, // ✅ Filters pricingIds to return only the matching one
    });

    // Remove timeSlots where pricingIds array is empty after filtering
    const filteredTimeSlots = timeSlots.filter(slot => slot.pricingIds.length > 0);

    if (!filteredTimeSlots.length) {
      return res.status(404).json({ success: false, message: "No time slots found for the given date and pricing ID" });
    }

    // Return time slots along with pricing information
    return res.status(200).json({ success: true, timeSlots: filteredTimeSlots });
  } catch (error) {
    console.error("Error fetching pricing by date:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};


// Helper function to get full day hours based on the park's schedule
const getFullDayHours = async (parkId, date) => {
  const inputDate = new Date(date);
  const park = await Park.findById(parkId);
  if (!park) throw new Error("Park not found");

  // Get the day of the week (e.g., "Monday", "Tuesday")
  const dayOfWeek = inputDate.toLocaleDateString("en-US", { weekday: "long" });

  // Check if the date falls within a special period
  const specialPeriod = park.specialPeriods.find((period) => {
    const startDate = new Date(period.startDate);
    const endDate = new Date(period.endDate);
    return inputDate >= startDate && inputDate <= endDate;
  });

  // If the date is within a special period
  if (specialPeriod) {
    if (!specialPeriod.openDays.includes(dayOfWeek)) {
      throw new Error(`The park is closed on ${dayOfWeek} during the special period`);
    }

    return {
      fullDayStart: specialPeriod.hours.from,
      fullDayEnd: specialPeriod.hours.to,
    };
  }

  // If no special period, check if the day is closed
  if (park.closedDays.includes(dayOfWeek)) {
    throw new Error(`The park is closed on ${dayOfWeek}`);
  }

  // Use default hours if no custom hours are available
  const fullDayStart = park.defaultHours.from;
  const fullDayEnd = park.defaultHours.to;

  return { fullDayStart, fullDayEnd };
};

const deleteAllPrices = async (req, res) => {
  try {
    const { parkId } = req.params;

    // Validate parkId
    if (!mongoose.Types.ObjectId.isValid(parkId)) {
      return res.status(400).json({ success: false, message: "Invalid Park ID" });
    }

    // Check if the park exists
    const existingPark = await Park.findById(parkId);
    if (!existingPark) {
      return res.status(404).json({ success: false, message: "Park not found" });
    }

    // Delete all pricing entries for the given park
    const result = await Pricing.deleteMany({ parkId });

    return res.status(200).json({ 
      success: true, 
      message: `${result.deletedCount} pricing entries deleted successfully` 
    });

  } catch (error) {
    console.error("Error deleting prices:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};


export { getPricingByDate, deleteAllPrices,addPricing, getAllPricing, getPricingById, updateProduct, deleteProduct };