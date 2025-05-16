export interface HeroSection {
  title: string
  description: string
}

export interface AboutSectionContent {
  paragraph: string
  history: string
  commitment: string
}

export interface AboutSection {
  title: string
  content: AboutSectionContent
  mainImage: string
  yearsExperience: number
}

export interface Stat {
  value: string
  label: string
}

export interface TeamMember {
  name: string
  role: string
  image: string
}

export interface Value {
  title: string
  description: string
  icon: string
}

export interface SEO {
  metaTitle?: string
  metaDescription?: string
  keywords?: string[]
}

export interface AboutPage {
  id?: string
  heroSection: HeroSection
  aboutSection: AboutSection
  stats: Stat[]
  teamMembers: TeamMember[]
  values: Value[]
  seo: SEO
  lastUpdated: Date
}
