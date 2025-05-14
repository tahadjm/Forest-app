// Export all services from a single file for easier imports

// Core API client
export { default as apiClient, fetchApi } from "@/lib/api-client"

// Authentication
export { default as AuthService } from "./auth-service"

// Park management
export { default as ParkService } from "./park-service"
export { default as ActivityService } from "./activity-service"
export { default as ParcoursService } from "./parcours-service"
export { default as PricingService } from "./pricing-service"
export { default as TimeSlotService } from "./time-slot-service"

// Booking and payments
export { default as BookingService } from "@/services/booking-service"
export { default as CartService } from "./cart-service"
export { default as PaymentService } from "./payment-service"

// Content management
export {
  FAQService,
  NewsService,
  AboutPageService,
  ChangelogService,
} from "./content-service"
