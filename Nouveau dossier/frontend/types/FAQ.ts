export type FAQItem = {
  question: string
  answer: string
  createdAt?: Date
  updatedAt?: Date
}

export type FAQSection = {
  heroSection: {
    title: string
    description: string
  }
  faqs: FAQItem[]
  contactSection: {
    title: string
    description: string
  }
}

export type FAQDocument = FAQSection
