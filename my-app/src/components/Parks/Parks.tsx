"use client"

import { useEffect, useState } from "react"
import { ParkService } from "@/services/park-service"
import { AlertCircle, RefreshCw, WifiOff, MapPin, ArrowRight } from "lucide-react"
import { HeroSection } from "@/components/ui/hero-section"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"

export function Parks() {
  const [parks, setParks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isOffline, setIsOffline] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    const fetchParks = async () => {
      try {
        setLoading(true)
        setError(null)

        // Check if we're online
        const isOnline = navigator.onLine

        // Get parks data - pass true to force fallback if offline
        const response = await ParkService.getAllParks(!isOnline)
        console.log("API Response:", response)

        // Check if the response has a data property (common in axios responses)
        const parksData = response.data ? response.data : response
        console.log("Parks data to be used:", parksData)

        // Update offline status if the response indicates we're using fallback data
        setIsOffline(response.isOffline || false)

        // Ensure each park has a valid imageUrl
        const processedParks = Array.isArray(parksData)
          ? parksData.map((park) => {
              // Make sure imageUrl is properly formatted with the correct base URL
              let imageUrl = park.imageUrl
              if (imageUrl && !imageUrl.startsWith("http") && !imageUrl.startsWith("/")) {
                // If it's a relative path, make it absolute
                imageUrl = `http://localhost:8000/${imageUrl}`
              } else if (!imageUrl) {
                // Use a default image if none provided
                imageUrl = "/placeholder-park.jpg"
              }

              // Extract features from activities or use default features
              const features = park.activities
                ? park.activities.slice(0, 3).map((activity) => activity.name || activity)
                : ["Aventure", "Nature", "Loisirs"]

              return {
                ...park,
                imageUrl,
                features,
                location: park.location || "France",
              }
            })
          : []

        setParks(processedParks)
        setLoading(false)
      } catch (error) {
        console.error("Failed to fetch parks:", error)
        setError(error.message || "Failed to fetch parks")
        setIsOffline(true) // Assume we're offline if there's an error
        setLoading(false)
      }
    }

    fetchParks()
  }, [retryCount]) // Depend on retryCount to trigger refetch when user clicks retry

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1)
  }

  if (loading) {
    return (
      <section className="w-full py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
          <p className="text-center text-gray-500 mt-4">Chargement des parcs...</p>
        </div>
      </section>
    )
  }

  if (error && parks.length === 0) {
    return (
      <section className="w-full py-12">
        <div className="container mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <div className="flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-red-500 mr-2" />
              <h3 className="text-lg font-medium text-red-800">Erreur de chargement</h3>
            </div>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={handleRetry}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="w-full py-12 md:py-24">
      <HeroSection
        title="Découvrez Nos Parcs"
        description="Explorez l'aventure et la nature avec nos parcs exceptionnels"
        backgroundType="color"
        height="small"
        className="mb-12"
      >
        {/* Offline indicator */}
        {isOffline && (
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800 mt-4">
            <WifiOff className="h-4 w-4 mr-1" />
            Mode hors ligne
            <button
              onClick={handleRetry}
              className="ml-2 text-amber-900 hover:text-amber-700 focus:outline-none"
              aria-label="Réessayer la connexion"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </HeroSection>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {parks && parks.length > 0 ? (
            parks.map((park) => (
              <Card key={park._id} className="overflow-hidden">
                <div className="relative h-48">
                  <Image
                    src={park.imageUrl || "/placeholder.svg?height=400&width=600"}
                    alt={park.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{park.name || "Parc sans nom"}</CardTitle>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {park.location}
                    </Badge>
                  </div>
                  <CardDescription>{park.description || "Aucune description disponible"}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {park.features.map((feature, index) => (
                      <Badge key={index} variant="secondary">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href={`/park/${park._id}`}>
                      Explorer le Parc <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <p className="text-center text-gray-500 col-span-full py-10">Aucun parc trouvé.</p>
          )}
        </div>
      </div>
    </section>
  )
}
