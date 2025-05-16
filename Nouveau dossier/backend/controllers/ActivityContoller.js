import Activity from "../models/ActivitySchema.js";
// import { validateActivity } from "../middlewares/Validator.js";
import {activitySchema} from "../middlewares/Validator.js"

// ✅ Ajouter une nouvelle activité
export const addNewActivity = async (req, res) => {
  try {
    const {parkId} = req.params;
    const requestData = { ...req.body ,parkId }
    const { value,error } = activitySchema.validate(requestData, { abortEarly: false });
    if (error) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: error.details.map(err => err.message),
        });
      }
      const newActivity = new Activity(value);
      await newActivity.save();

    res.status(201).json({
      success: true,
      message: "Activity created successfully",
      data: newActivity,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const getActivityByParkId = async (req, res) =>{
  try {
    const {parkId} = req.params
    const activities = await Activity.find({parkId})

    res.status(200).json({
      success: true,
      data: activities,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};


// ✅ Récupérer toutes les activités
export const getAllActivities = async (req, res) => {
  try {
    const activities = await Activity.find()

    res.status(200).json({
      success: true,
      data: activities,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ✅ Récupérer une activité par ID
export const getActivityById = async (req, res) => {
  try {
    const { activityId } = req.params;
    const activity = await Activity.findById(activityId)

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }

    res.status(200).json({
      success: true,
      data: activity,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ✅ Mettre à jour une activité
export const updateActivity = async (req, res) => {
  try {
    const { activityId } = req.params;

    const updatedActivity = await Activity.findByIdAndUpdate(activityId, req.body, { new: true });

    if (!updatedActivity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Activity updated successfully",
      data: updatedActivity,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ✅ Supprimer une activité
export const deleteActivity = async (req, res) => {
  try {
    const { activityId } = req.params;
    const deletedActivity = await Activity.findByIdAndDelete(activityId);

    if (!deletedActivity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Activity deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};