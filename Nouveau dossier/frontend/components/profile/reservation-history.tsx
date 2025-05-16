"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Calendar, Clock, MapPin, Users, Download, RefreshCw, AlertCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { IBooking } from "@/types/booking"
import { BookingService } from "@/services"
import Image from "next/image"
import Link from "next/link"

interface ReservationHistoryProps {
  userId?: string
}

export function ReservationHistory({ userId }: ReservationHistoryProps) {
  const [state, setState] = useState({
    loading: true,
    error: null as string | null,
    bookings: [] as IBooking[],
  })
  const [activeTab, setActiveTab] = useState("upcoming")
  const [refreshing, setRefreshing] = useState(false)

  const fetchBookings = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const response = await BookingService.getCurrentUserBookings()
      const bookings = Array.isArray(response?.bookings) ? response.bookings : []

      setState({
        loading: false,
        bookings,
        error: null,
      })
    } catch (error) {
      setState({
        loading: false,
        bookings: [],
        error: "Impossible de charger vos réservations. Veuillez réessayer.",
      })
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [userId])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchBookings()
    setRefreshing(false)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("fr-FR")
    } catch {
      return "Date invalide"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Confirmée</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">En attente</Badge>
      case "completed":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">Terminée</Badge>
      case "canceled":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Annulée</Badge>
      default:
        return null
    }
  }

  // Filter bookings based on date
  const currentDate = new Date()
  // Set time to beginning of day for accurate comparison
  currentDate.setHours(0, 0, 0, 0)

  const upcomingReservations = state.bookings.filter((booking) => {
    if (!booking?.date) return false
    try {
      const bookingDate = new Date(booking.date)
      return bookingDate >= currentDate
    } catch {
      return false
    }
  })

  const pastReservations = state.bookings.filter((booking) => {
    if (!booking?.date) return false
    try {
      const bookingDate = new Date(booking.date)
      return bookingDate < currentDate
    } catch {
      return false
    }
  })

  if (state.loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-muted-foreground">Chargement de vos réservations...</p>
      </div>
    )
  }

  if (state.error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-red-500 mb-4">{state.error}</p>
        <Button onClick={handleRefresh} disabled={refreshing}>
          {refreshing ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Actualisation...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Réessayer
            </>
          )}
        </Button>
      </div>
    )
  }

  if (state.bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Vous n'avez pas encore de réservations.</p>
        <Button>Réserver une activité</Button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
          {refreshing ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Actualisation...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Actualiser
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="upcoming">À venir</TabsTrigger>
          <TabsTrigger value="past">Passées</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          {upcomingReservations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Vous n'avez pas de réservations à venir.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {upcomingReservations.map((booking) => (
                <Card key={booking._id || booking.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {booking.pricing?.name || booking.activity || "Activité inconnue"}
                        </h3>
                        <p className="text-muted-foreground">
                          {typeof booking.park === "string" ? booking.park : booking.park?.name || "Lieu inconnu"}
                        </p>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{formatDate(booking.date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{booking.startTime || "N/A"}</span>
                        <span>-</span>
                        <span>{booking.endTime || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{typeof booking.park === "string" ? booking.park : booking.park?.location || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {booking.quantity || 0} {booking.quantity === 1 ? "personne" : "personnes"}
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex justify-between">
                        <span className="font-medium">Total</span>
                        <span className="font-bold">€{(booking.totalPrice || 0).toFixed(2)}</span>
                      </div>
                    </div>

                    {/* QR Code */}
                    {booking.QrCode && (
                      <div className="flex-shrink-0 flex items-center justify-center mt-4">
                        <div className="bg-white p-2 rounded-md shadow-sm border border-gray-100">
                          {booking._id ? (
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
                                  className="text-adventure-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                  size={20}
                                />
                              </div>
                            </Link>
                          ) : (
                            <Image
                              src={booking.QrCode || "/placeholder.svg"}
                              alt={`QR Code pour ${booking.TicketCode || "billet"}`}
                              width={100}
                              height={100}
                              className="w-[100px] h-[100px]"
                            />
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between mt-4 pt-4 border-t">
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Télécharger le billet
                      </Button>
                      {(booking.status === "confirmed" || booking.status === "pending") && (
                        <Button variant="destructive" size="sm">
                          Annuler la réservation
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past">
          {pastReservations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Vous n'avez pas de réservations passées.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {pastReservations.map((booking) => (
                <Card key={booking._id || booking.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {booking.pricing?.name || booking.activity || "Activité inconnue"}
                        </h3>
                        <p className="text-muted-foreground">
                          {typeof booking.park === "string" ? booking.park : booking.park?.name || "Lieu inconnu"}
                        </p>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{formatDate(booking.date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{booking.startTime || "N/A"}</span>
                        <span>-</span>
                        <span>{booking.endTime || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{typeof booking.park === "string" ? booking.park : booking.park?.name || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {booking.quantity || 0} {booking.quantity === 1 ? "personne" : "personnes"}
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex justify-between">
                        <span className="font-medium">Total</span>
                        <span className="font-bold">€{(booking.totalPrice || 0).toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="flex justify-end mt-4 pt-4 border-t">
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Télécharger le reçu
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
