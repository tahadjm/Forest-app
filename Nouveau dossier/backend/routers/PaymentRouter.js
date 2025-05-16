import express from "express"
import { CreateCheckout, WebhookHandler } from "../controllers/PaymentController.js"
import { identifier } from "../middlewares/identifier.js"

const router = express.Router()
router.post("/create-checkout", identifier, CreateCheckout)

// Fix the webhook route - express.raw middleware should come first
router.post("/webhook", express.raw({ type: "application/json" }), WebhookHandler)

export const PaymentRouter = router

