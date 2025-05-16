
import Cart from "../models/CartModel.js";
import Pricing from "../models/Pricing.js";
import { TimeSlotInstance } from "../models/TimeSlotInstance.js";
import { TimeSlotTemplate } from "../models/TimeSlotTemplate.js";
import mongoose from "mongoose";

// Sync Cart
export const syncCart = async (req, res) => {
  try {
    const { items } = req.body; // Extract cart items from request

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ success: false, message: "Invalid cart data" });
    }

    // Calculate total items and total price
    const totalItems = items.reduce((total, item) => total + item.quantity, 0);
    const totalPrice = items.reduce((total, item) => total + item.price * item.quantity, 0);

    // Respond with updated cart summary
    return res.status(200).json({
      success: true,
      items,
      totalItems,
      totalPrice,
    });
  } catch (error) {
    console.error("Error syncing cart:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 🛒 Add item to cart (Updated for instance system)
export const addItemToCart = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user.id;
    const { pricingId, instanceId, quantity } = req.body;
    
    // Validate input
    if (!pricingId || !instanceId || quantity < 1) {
      return res.status(400).json({ message: "Invalid input fields" });
    }

    // Get pricing and instance with template populated
    const [pricing, instance] = await Promise.all([
      Pricing.findById(pricingId).session(session),
      TimeSlotInstance.findById(instanceId)
        .populate('templateId')
        .session(session)
    ]);

    // Validate availability
    if (!pricing || !instance || instance.availableTickets < quantity) {
      throw new Error("Invalid pricing or not enough available tickets");
    }

    // Get park ID from template
    const parkId = instance.templateId.parkId;

    // Find or create cart
    let cart = await Cart.findOne({ user: userId, status: "pending" }).session(session);
    if (!cart) {
      cart = new Cart({ 
        user: userId,
        bookings: [],
        status: "pending"
      });
    }

    // Check for existing item
    const existingItem = cart.bookings.find(item => 
      item.pricing.equals(pricingId) && 
      item.timeSlotInstance.equals(instanceId)
    );

    // Calculate final price
    const finalPrice = pricing.price + (instance.templateId.priceAdjustment || 0);

    if (existingItem) {
      // Update existing item
      existingItem.quantity += quantity;
      existingItem.totalPrice = finalPrice * existingItem.quantity;
    } else {
      // Add new item
      cart.bookings.push({
        pricing: pricingId,
        park: parkId,
        pricingName: pricing.name,
        timeSlotInstance: instanceId,
        quantity,
        totalPrice: finalPrice * quantity,
        unitPrice: finalPrice,
        date: instance.date,
        startTime: instance.templateId.startTime,
        endTime: instance.templateId.endTime
      });
    }

    // Reserve tickets
    
    // Save changes
    await Promise.all([
      instance.save({ session }),
      cart.save({ session })
    ]);

    await session.commitTransaction();
    
    // Return populated cart
    const populatedCart = await Cart.findById(cart._id)
      .populate('bookings.pricing')
      .populate({
        path: 'bookings.timeSlotInstance',
        populate: { path: 'templateId' }
      });

    res.status(200).json(populatedCart);
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

// 🛒 Update cart item quantity (Updated)
export const updateCartItem = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { itemId } = req.params;
    const userId = req.user.id;
    const { quantity } = req.body;

    // Validate quantity
    if (quantity < 1 || !Number.isInteger(quantity)) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    // Find cart with populated data
    const cart = await Cart.findOne({ user: userId, status: "pending" })
      .populate({
        path: 'bookings.timeSlotInstance',
        populate: { path: 'templateId' }
      })
      .session(session);

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Find cart item
    const item = cart.bookings.find(i => i._id.toString() === itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Get instance
    const instance = await TimeSlotInstance.findById(item.timeSlotInstance)
      .session(session);
    if (!instance) {
      return res.status(404).json({ message: "Instance not found" });
    }
    // Calculate difference
    const quantityDiff = quantity - item.quantity;
    // Check availability
    if (instance.availableTickets < quantityDiff) {
      throw new Error("Not enough available tickets");
    }
    const total = item.totalPrice * quantity

    // Update quantities
    item.quantity = quantity;
    item.totalPrice = total;

    // Save changes
    await Promise.all([
      cart.save({ session })
    ]);

    await session.commitTransaction();

    res.status(200).json(cart);
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

// 🛒 Get user's active cart
// 🛒 Get user's active cart
export const getUserCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await Cart.findOne({ user: userId, status: "pending" }).populate("bookings.pricing bookings.timeSlotInstance");

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    res.status(200).json(cart);
  } catch (error) {
    res.status(200).json({ message: "Failed to fetch cart", error: error.message });
  }
};

// 🛒 Get cart by user ID (Admin or Debugging Purpose)
export const getUserCartById = async (req, res) => {
  try {
    const { userId } = req.params;
    const cart = await Cart.findOne({ user: userId, status: "pending" }).populate("bookings.pricing bookings.timeSlotInstance");

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    res.status(200).json(cart);
  } catch (error) {
    res.status(200).json({ message: "Failed to fetch cart", error: error.message });
  }
};

// 🛒 Remove items from cart
export const removeCartItems = async (req, res) => {
  try {
    const { itemIds } = req.body;
    const userId = req.user.id;


    if (!Array.isArray(itemIds) || itemIds.length === 0) {
      return res.status(400).json({ message: "Invalid item IDs" });
    }

    const cart = await Cart.findOne({ user: userId, status: "pending" });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.bookings = cart.bookings.filter(item => !itemIds.includes(item._id.toString()));
    await cart.save();

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: "Failed to remove cart items", error: error.message });
  }
};

// ✅ Checkout & Confirm Cart (Updated)
export const checkoutCart = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user.id;
    const { paymentMethod } = req.body;

    // Find and lock cart
    const cart = await Cart.findOne({ user: userId, status: "pending" })
      .populate('bookings.timeSlotInstance')
      .session(session);

    if (!cart) {
      return res.status(404).json({ message: "No active cart found" });
    }

    // Verify all items still have availability
    for (const item of cart.bookings) {
      const instance = await TimeSlotInstance.findById(item.timeSlotInstance)
        .session(session);
      
      if (instance.availableTickets < item.quantity) {
        throw new Error(`Not enough tickets available for ${instance.date}`);
      }
    }

    // Process payment (mock)
    const paymentSuccess = processPaymentMock(cart.totalAmount, paymentMethod);

    if (!paymentSuccess) {
      // Release reservations
      await Promise.all(cart.bookings.map(async (item) => {
        await TimeSlotInstance.findByIdAndUpdate(
          item.timeSlotInstance,
          { $inc: { availableTickets: item.quantity } },
          { session }
        );
      }));

      cart.status = "cancelled";
      cart.paymentStatus = "failed";
      await cart.save({ session });
      
      await session.commitTransaction();
      return res.status(400).json({ message: "Payment failed" });
    }

    // Finalize booking
    cart.status = "confirmed";
    cart.paymentStatus = "paid";
    cart.paymentMethod = paymentMethod;

    // Create permanent bookings (example)
    await Promise.all(cart.bookings.map(async (item) => {
      await Booking.create([{
        user: userId,
        timeSlotInstance: item.timeSlotInstance,
        pricing: item.pricing,
        quantity: item.quantity,
        totalPrice: item.totalPrice,
        date: item.date
      }], { session });
    }));

    await cart.save({ session });
    await session.commitTransaction();

    res.status(200).json({ message: "Checkout successful", cart });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: "Checkout failed", error: error.message });
  } finally {
    session.endSession();
  }
};

// 🛒 Clear cart
export const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await Cart.findOne({ user: userId, status: "pending" });

    if (!cart || cart.bookings.length === 0) {
      return res.status(200).json({ message: "Cart is already empty" });
    }

    cart.bookings = [];
    await cart.save();

    res.status(200).json({ message: "Cart cleared successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to clear cart", error: error.message });
  }
};

// Helper function (mock payment processor)
const processPaymentMock = (amount, method) => {
  // Implement real payment processing here
  return Math.random() > 0.1; // 90% success rate for demo
};