import apiClient from "@/lib/api-client"
import type { FAQDocument } from "@/types/FAQ"
import type { NewsSection } from "@/types/news"
import type { SecuritySection } from "@/types/security"
import type { AboutPage } from "@/types/aboutPage"

// FAQ Service
export const FAQService = {
  // Get all FAQs
  getFaqs: async (): Promise<FAQDocument> => {
    try {
      const response = await apiClient.get("/faq")
      return response.data
    } catch (error) {
      console.error("Failed to fetch FAQs:", error)
      throw new Error("Failed to fetch FAQs. Please try again later.")
    }
  },

  // Create a new FAQ
  createFAQ: async (data: FAQDocument): Promise<FAQDocument> => {
    try {
      const response = await apiClient.post("/faq", data)
      return response.data
    } catch (error) {
      console.error("Failed to create FAQ:", error)
      throw new Error("Failed to create FAQ. Please check your input and try again.")
    }
  },

  // Add FAQ item
  addFaqItem: async (data: FAQDocument, id: string): Promise<FAQDocument> => {
    try {
      const response = await apiClient.post(`/faq/items/${id}`, data)
      return response.data
    } catch (error) {
      console.error("Failed to add FAQ item:", error)
      throw new Error("Failed to add FAQ item. Please check your input and try again.")
    }
  },

  // Update a FAQ by ID
  updateFAQ: async (id: string, data: Partial<FAQDocument>): Promise<FAQDocument> => {
    try {
      const response = await apiClient.patch(`/faq/${id}`, data)
      return response.data
    } catch (error) {
      console.error(`Failed to update FAQ ${id}:`, error)
      throw new Error("Failed to update FAQ. Please try again later.")
    }
  },

  // Delete a FAQ by ID
  deleteFAQ: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/faq/${id}`)
    } catch (error) {
      console.error(`Failed to delete FAQ ${id}:`, error)
      throw new Error("Failed to delete FAQ. Please try again later.")
    }
  },

  // Delete a FAQ item
  deleteFAQItem: async (id: string, itemId: string): Promise<void> => {
    try {
      await apiClient.delete(`/faq/${id}/items/${itemId}`)
    } catch (error) {
      console.error(`Failed to delete FAQ item ${itemId}:`, error)
      throw new Error("Failed to delete FAQ item. Please try again later.")
    }
  },
}

// News Service
export const NewsService = {
  // Get all news
  getNews: async (): Promise<NewsSection> => {
    try {
      const response = await apiClient.get("/news")
      return response.data
    } catch (error) {
      console.error("Failed to fetch News Section:", error)
      throw new Error("Failed to fetch News Section. Please try again later.")
    }
  },

  // Create news
  createNews: async (data: NewsSection): Promise<NewsSection> => {
    try {
      const response = await apiClient.post("/news", data)
      return response.data
    } catch (error) {
      console.error("Failed to create News Section:", error)
      throw new Error("Failed to create News Section. Please check your input and try again.")
    }
  },

  // Update news
  updateNews: async (id: string, data: Partial<NewsSection>): Promise<NewsSection> => {
    try {
      const response = await apiClient.put(`/news/${id}`, data)
      return response.data
    } catch (error) {
      console.error(`Failed to update News Section ${id}:`, error)
      throw new Error("Failed to update News Section. Please try again later.")
    }
  },

  // Delete news
  deleteNews: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/news/${id}`)
    } catch (error) {
      console.error(`Failed to delete News Section ${id}:`, error)
      throw new Error("Failed to delete News Section. Please try again later.")
    }
  },
}

// About Page Service
export const AboutPageService = {
  // Get about page
  getAboutPage: async (): Promise<any> => {
    try {
      const response = await apiClient.get("/aboutpage")
      return response.data
    } catch (error) {
      console.error("Error fetching about page:", error)
      throw error
    }
  },

  // Create about page
  createAboutPage: async (data: AboutPage): Promise<AboutPage> => {
    try {
      const response = await apiClient.post("/aboutpage", data)
      return response.data
    } catch (error) {
      console.error("Error adding about page:", error)
      throw error
    }
  },

  // Update about page
  updateAboutPage: async (id: string, data: Partial<AboutPage>): Promise<AboutPage> => {
    try {
      const response = await apiClient.patch(`/aboutpage/${id}`, data)
      return response.data
    } catch (error) {
      console.error("Error updating about page:", error)
      throw error
    }
  },

  // Delete about page
  deleteAboutPage: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/aboutpage/${id}`)
    } catch (error) {
      console.error("Error deleting about page:", error)
      throw error
    }
  },
}

// Changelog Service
interface Changelog {
  _id: string
  title: string
  content: {
    description: string
    updates: string[]
    images: { src: string; alt: string }[]
  }
}

export const ChangelogService = {
  // Get all changelogs
  getChangelogs: async (): Promise<Changelog[]> => {
    try {
      const response = await apiClient.get("/changelog")
      return response.data
    } catch (error) {
      console.error("Error fetching changelogs:", error)
      throw error
    }
  },

  // Add a new changelog
  addChangelog: async (changelog: Changelog): Promise<Changelog> => {
    try {
      const response = await apiClient.post("/changelog", changelog)
      return response.data
    } catch (error) {
      console.error("Error adding changelog:", error)
      throw error
    }
  },

  // Update a changelog by ID
  updateChangelog: async (id: string, changelog: Partial<Changelog>): Promise<Changelog> => {
    try {
      const response = await apiClient.put(`/changelog/${id}`, changelog)
      return response.data
    } catch (error) {
      console.error("Error updating changelog:", error)
      throw error
    }
  },

  // Delete a changelog by ID
  deleteChangelog: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/changelog/${id}`)
    } catch (error) {
      console.error("Error deleting changelog:", error)
      throw error
    }
  },
}
export const SecuritySectionService = {
  // Get all security sections (sorted by order)
  getSections: async (): Promise<SecuritySection[]> => {
    try {
      const response = await apiClient.get("/Security")
      return response.data.data
    } catch (error) {
      console.error("Failed to fetch security sections:", error)
      throw new Error("Failed to fetch security sections. Please try again later.")
    }
  },

  // Create a new security section
  createSection: async (data: Omit<SecuritySection, "_id">): Promise<SecuritySection> => {
    try {
      const response = await apiClient.post("/Security", data)
      return response.data
    } catch (error) {
      console.error("Failed to create security section:", error)
      throw new Error("Failed to create security section. Please check your input and try again.")
    }
  },

  // Update a security section by ID
  updateSection: async (id: string, data: Partial<SecuritySection>): Promise<SecuritySection> => {
    try {
      const response = await apiClient.patch(`/Security/${id}`, data)
      return response.data
    } catch (error) {
      console.error(`Failed to update security section ${id}:`, error)
      throw new Error("Failed to update security section. Please try again later.")
    }
  },

  // Delete a security section by ID
  deleteSection: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/Security/${id}`)
    } catch (error) {
      console.error(`Failed to delete security section ${id}:`, error)
      throw new Error("Failed to delete security section. Please try again later.")
    }
  },

  // Reorder sections (optional - if you need bulk update functionality)
  reorderSections: async (orderedIds: string[]): Promise<void> => {
    try {
      await apiClient.patch("/Security/reorder", { orderedIds })
    } catch (error) {
      console.error("Failed to reorder sections:", error)
      throw new Error("Failed to reorder sections. Please try again later.")
    }
  },
}
