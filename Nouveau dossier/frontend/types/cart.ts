// Define the time slot instance structure
export interface TimeSlot {
  _id: string
  templateId: string
  date: string
  startTime: string
  endTime: string
  availableTickets: number
  ticketLimit: number
  priceAdjustment: number
}

// Define the cart item structure based on the MongoDB schema
export interface CartItem {
  _id?: string
  park: string
  pricingId: string
  pricingName: string
  timeSlotInstanceId?: string
  timeSlotInstance?: TimeSlot | string
  quantity: number
  unitPrice: number
  totalPrice?: number
  date: string
  startTime: string
  endTime: string
}

// Define the cart structure
export interface Cart {
  _id: string
  user: string
  bookings: CartItem[]
  status: "pending" | "confirmed" | "cancelled"
  paymentStatus?: "pending" | "paid" | "failed"
  paymentMethod?: string
  totalAmount?: number
}
