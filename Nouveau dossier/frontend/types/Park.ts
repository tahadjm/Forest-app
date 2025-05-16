export type Park = {
  _id?: string
  name: string
  location: string
  imageUrl: string
  headerMedia?: string // URL for video header
  workingHours: {
    [day: string]: {
      from: string
      to: string
      closed: boolean
    }
  }
  maxBookingDays: number
  description?: string
  galleryImages: string[]
  facilities: string[]
  rules: {
    ruleNumber: number
    description: string
  }[]
  closedDays?: string[]
}
