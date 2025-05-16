import express from "express";
import {
    addPricing,
    getAllPricing,
    getPricingById,
    updateProduct,
    deleteProduct,
    getPricingByDate,
    deleteAllPrices,
} from "../controllers/PricingContoller.js";

const router = express.Router();

// ✅ Create a new pricing entry for a specific park
router.post("/:parkId", addPricing);

// ✅ Retrieve all pricing entries for a specific park
router.get("/:parkId", getAllPricing);
router.get("/day/:parkId", getPricingByDate);



// ✅ Retrieve a specific pricing entry by ID
router.get("/:parkId/:pricingId", getPricingById);

// ✅ Update a specific pricing entry
router.put("/:parkId/:productId", updateProduct);

// ✅ Delete a specific pricing entry
router.delete("/:parkId/:pricingId", deleteProduct);

// Delelete all prices for that park
router.delete("/delete/:parkId/delete-all-prices", deleteAllPrices);

export const PricingRouter = router;