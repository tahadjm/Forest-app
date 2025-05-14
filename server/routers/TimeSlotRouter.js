// import express from "express";
// import {
//   addTimeSlot,
//   getTimeSlots,
//   updateTimeSlot,
//   deleteTimeSlot,
//   autoFillTimeSlots,
//   getTimeSlotsWithPricing,
//   getTimeSlotsByDayAndPricing,
//   getTimeSlotById,
// } from "../controllers/TimeSlotConroller.js";
// import { migrateTimeSlots } from "../migration/migrateTimeSlots.js";

// const router = express.Router();

// // Route to add a time slot for a park using selected days (day-of-week)
// router.post("/:parkId", addTimeSlot);

// // Route to get all time slots (optionally filtered by day-of-week)
// router.get("/:parkId/", getTimeSlots);

// //Route to get time slot with Id
// router.get("/id/:id", getTimeSlotById)

// // Route to update a time slot by its ID
// router.put("/:id", updateTimeSlot);

// // Route to delete a time slot by its ID
// router.delete("/:id", deleteTimeSlot);

// // Route to auto-fill time slots for selected days based on working hours
// router.post("/:parkId/auto-fill-slots", autoFillTimeSlots);

// // Route to get time slots for a specific day and pricing
// router.get("/dayofweek/:parkId/", getTimeSlotsByDayAndPricing);

// // Migration route - run this once to migrate existing data
// router.post("/migrate", async (req, res) => {
//   try {
//     console.log("Received request:", req.body);
//     const { parkId } = req.body;
//     if (!parkId) {
//       return res.status(400).json({ message: "❌ Missing park ID." });
//     }
//     const result = await migrateTimeSlots(parkId);
//     res.status(200).json(result);
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

import express from "express";
import {
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getAvailability,
  updateInstance
  ,getTemplates,
  getInstances,
  generateSlotDates,
  checkOverlap
} from "../controllers/TimeSlotConroller.js";

const router = express.Router();

// Template management
router.get("/templates/:parkId", getTemplates);
// router.get("/templates/generate-slot-dates", generateSlotDates);
router.post("/templates/check-overlap",checkOverlap)
router.post("/parks/:parkId/templates", createTemplate);
router.put("/templates/:id", updateTemplate);
router.delete("/templates/:id", deleteTemplate);

// Availability and instances
// router.get("/instances/:id", getAvailability);
router.get("/instances", getInstances);
router.get("/parks/:parkId/availability", getAvailability);
router.put("/instances/:id", updateInstance);

export const SlotRouter = router;
