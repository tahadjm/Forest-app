import express from "express";
import {
  addItemToCart,
  getUserCart,
  updateCartItem,
  removeCartItems,
  clearCart,
  getUserCartById,
  syncCart,
} from "../controllers/CartController.js";
import { identifier } from "../middlewares/identifier.js";

const router = express.Router();

// 🛒 Add item to cart
router.post("/add", identifier, addItemToCart);

// 🛒 Get user's cart
router.get("/", identifier, getUserCart);


// 🛒 Sync user's cart
router.post("/sync", identifier, syncCart);


router.get("/get-by-id/:userId", getUserCartById);

// 🛒 Update item quantity
router.put("/items/:itemId", identifier, updateCartItem);

// 🛒 Remove item from cart
router.delete("/items/remove", identifier, removeCartItems);

// 🛒 Clear entire cart
router.delete("/clear", identifier, clearCart);

export const CartRouter =  router;
