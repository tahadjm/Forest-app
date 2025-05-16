import {
    createPark,
    updatePark,
    getAllParks,
    getParkById,
    deletePark,
    addWorkingDay,
    getWorkingHoursForDay,
    getParkForCurrentUser,
    IsParkClosed,
    // uploadImage,
  } from "../controllers/ParkController.js";
  
import { Router } from 'express';
// import upload from "../middlewares/upload.js";
import { identifier } from '../middlewares/identifier.js';
const router = Router();

// router.post('/upload', upload.single('image'),uploadImage);


// Create a new park
router.post("/" ,createPark);

// Update a park by ID
router.put("/:id", updatePark);

router.get("/user",identifier,getParkForCurrentUser);

// Get working hours
router.get("/:id/working-hours", getWorkingHoursForDay);

//Get day Status (isClosed or not)
router.get("/:parkId/isClosed",IsParkClosed);

//add new worikng hour
router.patch("/:id/working-hours", addWorkingDay);

// Get all parks
router.get("/", getAllParks);

// Get a single park by ID
router.get("/:id", getParkById);

// Delete a park by ID
router.delete("/:id", deletePark);

export default router;

export const ParkRouter = router