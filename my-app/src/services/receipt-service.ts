import type { BookingStatus } from "@/services/payment-service"
import { fetchApi } from "@/lib/api-client"

export interface Receipt {
  id: string
  paymentId: string
  createdAt: string
  bookings: BookingStatus[]
  totalAmount: number
  customerEmail?: string
  customerName?: string
  paymentMethod: string
  status: "paid" | "pending" | "failed"
}

export class ReceiptService {
  private static STORAGE_KEY = "receipts"
  private static SESSION_KEY = "current_receipt"

  // ======== BACKEND API CALLS ========

  /**
   * Save receipt to database (API call)
   */
  static async saveToDatabase(receipt: Receipt): Promise<Receipt> {
    try {
      // Use fetchApi instead of apiClient.post
      return await fetchApi<Receipt>("/receipts", {
        method: "POST",
        data: receipt,
      })
    } catch (error) {
      console.error("Error saving receipt to database:", error)
      throw error
    }
  }

  /**
   * Get receipt by ID from database
   */
  static async getReceiptById(id: string): Promise<Receipt | null> {
    try {
      // Try local storage first for offline access
      const localReceipt = this.getLocalReceiptById(id)
      if (localReceipt) return localReceipt

      // If not in local storage, fetch from API
      try {
        const receipt = await fetchApi<Receipt>(`/receipts/${id}`)

        // Cache in local storage for future offline access
        this.saveToLocalStorage(receipt)

        return receipt
      } catch (error) {
        if ((error as any).response?.status === 404) {
          return null
        }
        throw error
      }
    } catch (error) {
      console.error("Error fetching receipt:", error)
      return null
    }
  }

  /**
   * Get all receipts for the current user
   */
  static async getUserReceipts(): Promise<Receipt[]> {
    try {
      const receipts = await fetchApi<Receipt[]>("/receipts")

      // Update local cache
      receipts.forEach((receipt: Receipt) => {
        this.saveToLocalStorage(receipt)
      })

      return receipts
    } catch (error) {
      console.error("Error fetching user receipts:", error)

      // Fallback to local storage if API fails
      return this.getLocalReceipts()
    }
  }

  // ======== LOCAL STORAGE FUNCTIONS ========

  /**
   * Save receipt to local storage for offline access
   */
  static saveToLocalStorage(receipt: Receipt): void {
    try {
      // Get existing receipts
      const existingReceipts = this.getLocalReceipts()

      // Add new receipt (or update if exists)
      const updatedReceipts = existingReceipts.filter((r) => r.id !== receipt.id)
      updatedReceipts.unshift(receipt) // Add to beginning of array

      // Limit to 10 most recent receipts to avoid storage issues
      const limitedReceipts = updatedReceipts.slice(0, 10)

      // Save back to localStorage
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(limitedReceipts))
    } catch (error) {
      console.error("Error saving receipt to localStorage:", error)
    }
  }

  /**
   * Get all receipts from local storage
   */
  static getLocalReceipts(): Receipt[] {
    try {
      const receiptsData = localStorage.getItem(this.STORAGE_KEY)
      return receiptsData ? JSON.parse(receiptsData) : []
    } catch (error) {
      console.error("Error getting receipts from localStorage:", error)
      return []
    }
  }

  /**
   * Get receipt by ID from local storage
   */
  static getLocalReceiptById(id: string): Receipt | null {
    try {
      const receipts = this.getLocalReceipts()
      return receipts.find((receipt) => receipt.id === id) || null
    } catch (error) {
      console.error("Error getting receipt by ID from localStorage:", error)
      return null
    }
  }

  // ======== SESSION STORAGE FUNCTIONS ========

  /**
   * Save current receipt to session storage (for cross-page navigation)
   */
  static saveToSessionStorage(receipt: Receipt): void {
    try {
      sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(receipt))
    } catch (error) {
      console.error("Error saving receipt to sessionStorage:", error)
    }
  }

  /**
   * Get receipt from session storage
   */
  static getFromSessionStorage(): Receipt | null {
    try {
      const receiptData = sessionStorage.getItem(this.SESSION_KEY)
      return receiptData ? JSON.parse(receiptData) : null
    } catch (error) {
      console.error("Error getting receipt from sessionStorage:", error)
      return null
    }
  }

  /**
   * Clear receipt from session storage
   */
  static clearSessionStorage(): void {
    sessionStorage.removeItem(this.SESSION_KEY)
  }

  // ======== UTILITY FUNCTIONS ========

  /**
   * Create a receipt from booking data
   */
  static createReceiptFromBookings(
    paymentId: string,
    bookings: BookingStatus[],
    customerInfo?: { email?: string; name?: string },
  ): Receipt {
    const totalAmount = bookings.reduce((sum, booking) => sum + booking.totalPrice, 0)

    return {
      id: `receipt_${Date.now()}`,
      paymentId,
      createdAt: new Date().toISOString(),
      bookings,
      totalAmount,
      customerEmail: customerInfo?.email,
      customerName: customerInfo?.name,
      paymentMethod: "Chargily", // Default from your example
      status: bookings.some((b) => b.paymentStatus === "paid") ? "paid" : "pending",
    }
  }

  /**
   * Download receipt as PDF
   */
  static async downloadReceipt(receipt: Receipt): Promise<void> {
    try {
      const jsPDFModule = await import("jspdf")
      const jsPDF = jsPDFModule.default
      const autoTableModule = await import("jspdf-autotable")
      const doc = new jsPDF()

      // Header
      doc.setFontSize(20)
      doc.setTextColor(41, 128, 185)
      doc.text("Adventure Park", 105, 20, { align: "center" })

      doc.setFontSize(16)
      doc.setTextColor(0, 0, 0)
      doc.text("REÇU DE PAIEMENT", 105, 30, { align: "center" })

      doc.setDrawColor(200, 200, 200)
      doc.line(20, 35, 190, 35)

      // Payment Info
      doc.setFontSize(10)
      doc.text("ID de Transaction:", 20, 45)
      doc.text(receipt.paymentId, 80, 45)

      doc.text("Date:", 20, 52)
      doc.text(
        new Date(receipt.createdAt).toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        80,
        52,
      )

      doc.text("Méthode de Paiement:", 20, 59)
      doc.text(receipt.paymentMethod || "Chargily", 80, 59)

      doc.text("Statut:", 20, 66)
      doc.text(receipt.status === "paid" ? "Payé" : receipt.status, 80, 66)

      // Customer Info if available
      let yPos = 73
      if (receipt.customerName || receipt.customerEmail) {
        doc.text("Client:", 20, yPos)
        doc.text(receipt.customerName || "Client", 80, yPos)
        yPos += 7

        if (receipt.customerEmail) {
          doc.text("Email:", 20, yPos)
          doc.text(receipt.customerEmail, 80, yPos)
          yPos += 7
        }
      }

      // Section Header
      doc.setFontSize(12)
      doc.setTextColor(41, 128, 185)
      doc.text("Détails de la Réservation", 20, yPos + 5)

      // Table content
      const tableColumn = ["Description", "Date", "Heure", "Participants", "Code Billet", "Prix"]
      const tableRows = receipt.bookings.map((booking) => [
        booking.pricing?.name || "Réservation",
        new Date(booking.date).toLocaleDateString("fr-FR"),
        `${booking.startTime || ""} - ${booking.endTime || ""}`,
        booking.quantity.toString(),
        booking.TicketCode || "N/A",
        `${booking.totalPrice.toFixed(2)} DZD`,
      ])

      autoTableModule.default(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: yPos + 10,
        theme: "grid",
        styles: { fontSize: 9 },
        headStyles: { fillColor: [41, 128, 185] },
      })

      // Position after table
      yPos = (doc as any).lastAutoTable.finalY + 10

      // QR Code Images
      if (receipt.bookings.some((b) => b.QrCode)) {
        doc.setFontSize(11)
        doc.setTextColor(41, 128, 185)
        doc.text("QR Codes des Réservations:", 20, yPos)
        yPos += 5

        receipt.bookings.forEach((booking, index) => {
          if (booking.QrCode) {
            doc.setFontSize(9)
            doc.setTextColor(0, 0, 0)
            doc.text(`Billet ${booking.TicketCode || `#${index + 1}`}:`, 20, yPos)

            try {
              doc.addImage(booking.QrCode, "PNG", 20, yPos + 2, 30, 30) // x, y, width, height
            } catch (err) {
              doc.text("Erreur lors de l'ajout du QR Code", 20, yPos + 10)
            }

            yPos += 40
          }
        })
      }

      // Total
      doc.setFontSize(12)
      doc.setTextColor(0, 0, 0)
      doc.text("Total:", 150, yPos)
      doc.setTextColor(41, 128, 185)
      doc.text(`${receipt.totalAmount.toFixed(2)} DZD`, 175, yPos)

      // Footer
      doc.setFontSize(8)
      doc.setTextColor(100, 100, 100)
      doc.text("Merci pour votre réservation chez Adventure Park!", 105, yPos + 20, { align: "center" })
      doc.text("Pour toute question, contactez-nous à support@adventurepark.dz", 105, yPos + 25, {
        align: "center",
      })

      // Save the file
      doc.save(`recu-${receipt.paymentId.substring(0, 8)}.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)
      throw new Error("Failed to download receipt")
    }
  }
}
