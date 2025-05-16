export type TimeSlotTemplate = {
  _id?: string
  parkId: string
  pricingIds: string[]
  startTime: string
  endTime: string
  daysOfWeek: number[]
  validFrom: string
  ValidUntil: string
  ticketLimit: number
  priceAdjustment: number
}
export type TimeSlotInstance = {
  _id?: string
  templateId: TimeSlotTemplate
  date: Date
  availableTickets: number
  ticketLimit: number
}
