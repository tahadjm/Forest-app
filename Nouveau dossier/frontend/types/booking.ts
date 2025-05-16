export interface IBooking {
  _id?: string
  id?: string
  userId?: string
  user?: {
    _id: string
    name: string
    email: string
  }
  park:
    | string
    | {
        _id: string
        name: string
        location?: string
      }
  activity?:
    | string
    | {
        _id: string
        name: string
      }
  timeSlotInstanceId?: string
  timeSlotInstance?: {
    _id: string
    templateId: string
    date: string
    startTime: string
    endTime: string
    availableTickets: number
    ticketLimit: number
  }
  type?: "parcours" | "activity"
  date: string
  startTime?: string
  endTime?: string
  quantity: number
  totalPrice: number
  unitPrice?: number
  status: "pending" | "confirmed" | "cancelled" | "completed"
  paymentStatus: "pending" | "paid" | "failed"
  paymentId?: string
  paymentMethod?: "edahabia" | "cib" | string
  QrCode?: string
  TicketCode?: string
  createdAt?: string
  updatedAt?: string
  pricing?: {
    name: string
    [key: string]: any
  }
  used: boolean
  usedAt: Date
}
