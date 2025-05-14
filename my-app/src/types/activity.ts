// Types based on the provided schema
export interface Feature {
  _id?: string
  feature: string
  description: string
  available: boolean
}

export interface Category {
  _id?: string
  name: string
  ageRequirement: string
  heightRequirement: string
  durationEstimated: string
  descriptionofCategory: string
  images?: string[]
  video?: string
}

export interface ActivityDetails {
  déroulement: string
  duration: string
  features: string[]
}

export interface SubParcours {
  _id?: string
  name?: string
  numberOfWorkshops?: number
  durationEstimated: string
  tyroliennes?: number
  description?: string
  images?: string[]
  video?: string
}

export interface Difficulty {
  level: "easy" | "medium" | "hard"
  description?: string
}

export interface Activity {
  _id: string
  parkId: string
  name: string
  HeaderImage: string
  HeaderVideo?: string
  images: string[]
  isParcours: boolean
  description?: string
  features: Feature[]
  categories?: Category[]
  details: ActivityDetails
  difficulty?: Difficulty
  subParcours?: SubParcours[]
}
