import express from "express";
import {
  addNewActivity,
  getAllActivities,
  getActivityById,
  updateActivity,
  deleteActivity,
  getActivityByParkId
} from "../controllers/ActivityContoller.js";
import { identifier } from "../middlewares/identifier.js";
// import { validateActivity } from "../middlewares/Validator.js"; // Import du middleware

const router = express.Router();

// 🌐 Routes pour les activités
router.post("/:parkId", addNewActivity); // Ajouter une nouvelle activité avec validation
router.get("/:parkId", getActivityByParkId); // Ajouter une nouvelle activité avec validation
router.get("/:activityId/get-by-activityId", getActivityById); // Récupérer une activité par ID
router.get("/", getAllActivities); // Récupérer toutes les activités
router.put("/:activityId", updateActivity); // Mettre à jour une activité avec validation
router.delete("/:activityId", deleteActivity); // Supprimer une activité

export const ActiviyRouter = router;