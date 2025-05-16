import Park from "../models/ParkShcema.js";  // ✅ Correct spelling
import { addWorkingDaySchema, parkSchema, updateParkSchema } from "../middlewares/Validator.js";
import moment from "moment"; // Import moment.js for date handling
import mongoose from "mongoose";

// ✅ Function to automatically set closed days based on working days
const updateClosedDays = (workingHours) => {
  const allDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const workingDays = Object.keys(workingHours).filter(day => !workingHours[day].closed);
  return allDays.filter(day => !workingDays.includes(day)); // Days not in workingHours are closed
};




// ✅ Create a new park
export const createPark = async (req, res) => {
  try {
    const { error, value } = parkSchema.validate(req.body, { abortEarly: false });

    if (error) {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.details.map((err) => err.message),
      });
    }

    // ✅ Automatically determine closedDays
    value.closedDays = updateClosedDays(value.workingHours);

    const newPark = new Park(value);
    await newPark.save();

    res.status(201).json({ message: "Park created successfully", data: newPark });
  } catch (err) {
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

export const IsParkClosed = async (req, res) => {
  try {
    const { parkId } = req.params;
    const { day } = req.query;

    // Validate parkId
    if (!mongoose.Types.ObjectId.isValid(parkId)) {
      return res.status(400).json({ message: "Invalid park ID" });
    }

    // Fetch park data
    const park = await Park.findById(parkId);
    if (!park) {
      return res.status(404).json({ message: "Park not found" });
    }

    // Determine the day of the week
    let dayOfWeek;
    if (day !== undefined) {
      const dayMap = {
        0: "Sunday",
        1: "Monday",
        2: "Tuesday",
        3: "Wednesday",
        4: "Thursday",
        5: "Friday",
        6: "Saturday",
      };

      dayOfWeek = dayMap[parseInt(day, 10)];

      if (!dayOfWeek) {
        return res.status(400).json({
          message: "Invalid input. Use a valid day number (0 for Sunday, 6 for Saturday)",
        });
      }
    } else {
      // Default to today's day if no day is provided
      dayOfWeek = moment().format("dddd");
    }

    // Check if the park is closed on the specified day
    const workingHours = park.workingHours.get(dayOfWeek);
    if (!workingHours || workingHours.closed) {
      return res.status(200).json({
        message: `${dayOfWeek} is closed.`,
        day: dayOfWeek,
        closed: true,
      });
    }

    res.status(200).json({
      message: `${dayOfWeek} is open.`,
      day: dayOfWeek,
      closed: false,
      workingHours,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const getParkForCurrentUser = async ( req,res) => {
  try {
    if(!req.user){
      return res.status(401).json({message:"Unauthorized access"})
    }
    else if(req.user.role !== "sous admin" && req.user.role !== "admin"){
      return res.status(401).json({message:"Unauthorized access"})
    }
    else if(req.user.role === "sous admin"){
      const park = await Park.findById(req.user.parkId)
      return res.json({
        message:"park retrived successfull",
        data:park
      })    }
    else if(req.user.role === "admin"){
      const park = await Park.find()
      return res.json({
        message:"park retrived successfull",
        data:park
      })
    }
  } catch (error) {
    res.status(500).json({message:"Internal server error",error:error.message})
  }
}



// ✅ Update a park by ID
export const updatePark = async (req, res) => {
  try {
    const { id } = req.params;
    const value  = req.body


    // ✅ Update closedDays automatically
    if (value.workingHours) {
      value.closedDays = updateClosedDays(value.workingHours);
    }

    const updatedPark = await Park.findByIdAndUpdate(id, value, {
      new: true,
      runValidators: true,
    });

    if (!updatedPark) {
      return res.status(404).json({ message: "Park not found" });
    }

    res.status(200).json({ message: "Park updated successfully", data: updatedPark });
  } catch (err) {
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

// ✅ Get all parks
export const getAllParks = async (req, res) => {
  try {
    const parks = await Park.find();
    res.status(200).json({ message: "Parks retrieved successfully", data: parks });
  } catch (err) {
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

// ✅ Get a single park by ID
export const getParkById = async (req, res) => {
  try {
    const park = await Park.findById(req.params.id);
    if (!park) {
      return res.status(404).json({ message: "Park not found" });
    }
    res.status(200).json({ message: "Park retrieved successfully", data: park });
  } catch (err) {
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

// ✅ Delete a park by ID
export const deletePark = async (req, res) => {
  try {
    const deletedPark = await Park.findByIdAndDelete(req.params.id);
    if (!deletedPark) {
      return res.status(404).json({ message: "Park not found" });
    }
    res.status(200).json({ message: "Park deleted successfully", data: deletedPark });
  } catch (err) {
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

// ✅ Add or update working day and update closedDays automatically
export const addWorkingDay = async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = addWorkingDaySchema.validate(req.body, { abortEarly: false });

    if (error) {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.details.map((err) => err.message),
      });
    }

    const { day, hours } = value;
    const park = await Park.findById(id);
    if (!park) {
      return res.status(404).json({ message: "Park not found" });
    }

    // ✅ Update the working hours for the specified day
    park.workingHours[day] = hours;

    // ✅ Recalculate closedDays
    park.closedDays = updateClosedDays(park.workingHours);

    await park.save();
    res.status(200).json({ message: `Working hours updated for ${day}`, data: park });
  } catch (err) {
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

// ✅ Get working hours for a specific day
// Récupère les horaires d'un jour spécifique
export const getWorkingHoursForDay = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    // Find the park by ID
    const park = await Park.findById(id);
    if (!park) {
      return res.status(404).json({ success: false, message: "Park not found." });
    }

    if (!date) {
      // No date provided, return all working hours
      return res.status(200).json({
        success: true,
        workingHours: park.workingHours,
      });
    }

    let dayOfWeek;

    // Check if input is a valid date
    if (moment(date, "YYYY-MM-DD", true).isValid()) {
      dayOfWeek = moment(date).format("dddd"); // Get day name from date
    } else {
      // Map day names/abbreviations to standardized format
      const dayMap = {
        sunday: "Sunday",
        sun: "Sunday",
        monday: "Monday",
        mon: "Monday",
        tuesday: "Tuesday",
        tue: "Tuesday",
        wednesday: "Wednesday",
        wed: "Wednesday",
        thursday: "Thursday",
        thu: "Thursday",
        friday: "Friday",
        fri: "Friday",
        saturday: "Saturday",
        sat: "Saturday"
      };

      const lowerInput = date.toLowerCase().trim();
      dayOfWeek = dayMap[lowerInput];

      if (!dayOfWeek) {
        return res.status(400).json({
          success: false,
          message: "Invalid input. Use date (YYYY-MM-DD) or day name (e.g., 'Friday', 'Fri')"
        });
      }
    }

    // Get working hours for the determined day
    const workingHours = park.workingHours.get(dayOfWeek);

    if (!workingHours || workingHours.closed) {
      return res.status(200).json({ 
        success: true, 
        message: `${dayOfWeek} is closed.`,
        day: dayOfWeek,
        closed: true
      });
    }

    res.status(200).json({ 
      success: true, 
      day: dayOfWeek,
      workingHours 
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
