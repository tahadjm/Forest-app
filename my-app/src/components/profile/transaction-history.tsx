"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Receipt, Download, ExternalLink, Search, Calendar, CreditCard, Clock, Users } from "lucide-react"
import { ReceiptService, type Receipt as ReceiptType } from "@/services/receipt-service"
import { format } from "date-fns"
import Image from "next/image"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"

export function TransactionHistory() {
  const [receipts, setReceipts] = useState<ReceiptType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptType | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        const userReceipts = await ReceiptService.getUserReceipts()
        setReceipts(userReceipts)
      } catch (error) {
        console.error("Error fetching receipts:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchReceipts()
  }, [])

  const handleDownloadReceipt = async (receipt: ReceiptType) => {
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
      doc.text(format(new Date(receipt.createdAt), "dd/MM/yyyy HH:mm"), 80, 52)

      doc.text("Méthode de Paiement:", 20, 59)
      doc.text(receipt.paymentMethod || "Chargily", 80, 59)

      doc.text("Statut:", 20, 66)
      doc.text(receipt.status === "paid" ? "Payé" : receipt.status, 80, 66)

      // Customer Info if available
      if (receipt.customerName || receipt.customerEmail) {
        doc.text("Client:", 20, 73)
        doc.text(receipt.customerName || "Client", 80, 73)

        if (receipt.customerEmail) {
          doc.text("Email:", 20, 80)
          doc.text(receipt.customerEmail, 80, 80)
        }
      }

      // Section Header
      doc.setFontSize(12)
      doc.setTextColor(41, 128, 185)
      doc.text("Détails de la Réservation", 20, 90)

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
        startY: 95,
        theme: "grid",
        styles: { fontSize: 9 },
        headStyles: { fillColor: [41, 128, 185] },
      })

      // Position after table
      let yPos = (doc as any).lastAutoTable.finalY + 10

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
      alert("Une erreur s'est produite lors de la génération du reçu. Veuillez réessayer.")
    }
  }

  const filteredReceipts = receipts.filter((receipt) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      receipt.paymentId.toLowerCase().includes(searchLower) ||
      (receipt.customerName && receipt.customerName.toLowerCase().includes(searchLower)) ||
      receipt.bookings.some(
        (booking) =>
          booking.TicketCode?.toLowerCase().includes(searchLower) ||
          (booking.pricing?.name && booking.pricing.name.toLowerCase().includes(searchLower)),
      )
    )
  })

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd MMM yyyy")
  }

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), "HH:mm")
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {selectedReceipt ? (
        <ReceiptDetail
          receipt={selectedReceipt}
          onBack={() => setSelectedReceipt(null)}
          onDownload={() => handleDownloadReceipt(selectedReceipt)}
        />
      ) : (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un reçu..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Tabs defaultValue="all" className="w-full md:w-auto">
              <TabsList>
                <TabsTrigger value="all">Tous</TabsTrigger>
                <TabsTrigger value="paid">Payés</TabsTrigger>
                <TabsTrigger value="pending">En attente</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {filteredReceipts.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <h3 className="mt-4 text-lg font-medium">Aucun reçu trouvé</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {searchTerm
                  ? "Aucun reçu ne correspond à votre recherche."
                  : "Vous n'avez pas encore de reçus de paiement."}
              </p>
              {searchTerm && (
                <Button variant="outline" className="mt-4" onClick={() => setSearchTerm("")}>
                  Effacer la recherche
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReceipts.map((receipt, index) => (
                <motion.div
                  key={receipt.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card
                    className="overflow-hidden hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedReceipt(receipt)}
                  >
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        {/* Status indicator */}
                        <div
                          className={`w-full md:w-1.5 h-1.5 md:h-auto ${
                            receipt.status === "paid"
                              ? "bg-green-500"
                              : receipt.status === "pending"
                                ? "bg-yellow-500"
                                : "bg-red-500"
                          }`}
                        />

                        <div className="p-4 md:p-6 flex-1">
                          <div className="flex flex-col md:flex-row justify-between">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">
                                Transaction #{receipt.id.substring(0, 8)}
                              </p>
                              <h3 className="text-lg font-semibold mt-1">{receipt.totalAmount.toFixed(2)} DZD</h3>
                            </div>

                            <div className="flex items-center mt-2 md:mt-0">
                              <div className="flex items-center mr-4">
                                <Calendar className="h-4 w-4 mr-1.5 text-muted-foreground" />
                                <span className="text-sm">{formatDate(receipt.createdAt)}</span>
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1.5 text-muted-foreground" />
                                <span className="text-sm">{formatTime(receipt.createdAt)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            {receipt.bookings.map((booking, idx) => (
                              <div key={idx} className="text-xs px-2 py-1 bg-muted rounded-md flex items-center">
                                <span>{booking.pricing?.name || "Réservation"}</span>
                                <span className="mx-1.5 text-muted-foreground">•</span>
                                <span>
                                  {booking.quantity} {booking.quantity > 1 ? "billets" : "billet"}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="mt-4 pt-4 border-t flex justify-between items-center">
                            <div className="flex items-center">
                              <CreditCard className="h-4 w-4 mr-1.5 text-muted-foreground" />
                              <span className="text-sm">{receipt.paymentMethod || "Chargily"}</span>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs h-8"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDownloadReceipt(receipt)
                                }}
                              >
                                <Download className="h-3.5 w-3.5 mr-1" />
                                Télécharger
                              </Button>
                              <Button variant="outline" size="sm" className="text-xs h-8">
                                Voir détails
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

interface ReceiptDetailProps {
  receipt: ReceiptType
  onBack: () => void
  onDownload: () => void
}

function ReceiptDetail({ receipt, onBack, onDownload }: ReceiptDetailProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          Retour
        </Button>
        <Button variant="outline" onClick={onDownload} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Télécharger le reçu
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Reçu de paiement</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Transaction #{receipt.id.substring(0, 8)}</p>
            </div>
            <div
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                receipt.status === "paid"
                  ? "bg-green-100 text-green-800"
                  : receipt.status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
              }`}
            >
              {receipt.status === "paid" ? "Payé" : receipt.status === "pending" ? "En attente" : "Échoué"}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Informations de paiement</h3>
                <div className="mt-2 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">ID de transaction</span>
                    <span className="text-sm font-medium">{receipt.paymentId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Date</span>
                    <span className="text-sm font-medium">{format(new Date(receipt.createdAt), "dd MMMM yyyy")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Heure</span>
                    <span className="text-sm font-medium">{format(new Date(receipt.createdAt), "HH:mm")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Méthode</span>
                    <span className="text-sm font-medium">{receipt.paymentMethod || "Chargily"}</span>
                  </div>
                </div>
              </div>
            </div>

            {(receipt.customerName || receipt.customerEmail) && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Informations client</h3>
                  <div className="mt-2 space-y-2">
                    {receipt.customerName && (
                      <div className="flex justify-between">
                        <span className="text-sm">Nom</span>
                        <span className="text-sm font-medium">{receipt.customerName}</span>
                      </div>
                    )}
                    {receipt.customerEmail && (
                      <div className="flex justify-between">
                        <span className="text-sm">Email</span>
                        <span className="text-sm font-medium">{receipt.customerEmail}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Détails de la réservation</h3>
            <div className="space-y-4">
              {receipt.bookings.map((booking, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-medium">{booking.pricing?.name || "Réservation"}</h5>
                        <span className="font-medium">{booking.totalPrice.toFixed(2)} DZD</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5 mr-1.5" />
                          {new Date(booking.date).toLocaleDateString("fr-FR", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                          })}
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <Users className="h-3.5 w-3.5 mr-1.5" />
                          {booking.quantity} {booking.quantity > 1 ? "participants" : "participant"}
                        </div>
                        {booking.TicketCode && (
                          <div className="flex items-center text-muted-foreground sm:col-span-2">
                            <Receipt className="h-3.5 w-3.5 mr-1.5" />
                            Code: <span className="font-mono ml-1">{booking.TicketCode}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {booking.QrCode && (
                      <div className="flex-shrink-0 flex items-center justify-center">
                        <div className="bg-white p-2 rounded-md shadow-sm border">
                          <Link href={booking.QrCode} target="_blank" className="block relative group">
                            <Image
                              src={booking.QrCode || "/placeholder.svg"}
                              alt={`QR Code pour ${booking.TicketCode || "billet"}`}
                              width={100}
                              height={100}
                              className="w-[100px] h-[100px]"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 flex items-center justify-center transition-all duration-200">
                              <ExternalLink
                                className="text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                size={20}
                              />
                            </div>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4 flex justify-between items-center">
            <span className="font-medium">Total</span>
            <span className="text-xl font-bold">{receipt.totalAmount.toFixed(2)} DZD</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
