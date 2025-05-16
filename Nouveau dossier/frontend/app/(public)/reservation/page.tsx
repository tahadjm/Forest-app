"use client"

import { useState, useEffect } from "react"
import { HeroSection } from "@/components/ui/hero-section"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, ArrowLeft } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import ProtectedRoute from "@/components/auth/protected-route"
import { ReservationHistory } from "@/components/profile/reservation-history"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { BookingService } from "@/services"

export default function ReservationPage() {
  return (
    <ProtectedRoute>
      <ReservationContent />
    </ProtectedRoute>
  )
}

function ReservationContent() {
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  console.log("Reservation Page - User:", user)

  // Simulate loading state for UI components
  useEffect(() => {
    const FetchUserbooking = async () => {
      try {
        const response = await BookingService.getCurrentUserBookings()
        console.log("User Bookings:", response)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching user bookings:", error)
        setLoading(false)
      }
    }
    FetchUserbooking()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection
        title="Mes Réservations"
        description="Consultez et gérez vos réservations passées et à venir"
        backgroundType="color"
        height="small"
      />

      <div className="container mx-auto py-12 px-4">
        <div className="mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link href="/profile" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Retour au profil
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-primary" />
              Historique des Réservations
            </CardTitle>
            <CardDescription>Consultez vos réservations passées et à venir</CardDescription>
          </CardHeader>
          <CardContent>{user && <ReservationHistory userId={user.id} />}</CardContent>
        </Card>
      </div>
    </div>
  )
}
