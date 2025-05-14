export type NewsSection = {
  _id?: string
  title: string
  description: string
  date: string
  image: string
  locations: string[] // Changed to an array of strings
  categories: string[] // Changed to an array of strings
  createdAt?: Date
  updatedAt?: Date
}
