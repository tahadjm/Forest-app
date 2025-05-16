"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { HeroSection } from "@/components/ui/hero-section"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ActivityService } from "@/services/activity-service"
import ActivityDetailsAttachment from "@/components/ActivityDetails/ActivityDetails"
import type { Activity } from "@/types/activity"
import type { Park } from "@/types/Park"
import { ParkService } from "@/services/park-service"

export default function ActivityPage() {
  const params = useParams()
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug
  const [activities, setActivities] = useState<Activity[]>([])
  const [park, setPark] = useState<Park | null>(null)
  const [loading, setLoading] = useState(true)
  // Fetch park data
  useEffect(() => {
    async function loadPark() {
      try {
        if (slug) {
          console.log("Loading park with slug:", slug)
          const parkData = await ParkService.getParkById(slug)
          console.log("Park data received:", parkData)
          setPark(parkData.data)
        } else {
          console.error("Park slug is undefined")
        }
      } catch (error) {
        console.error("Failed to load park:", error)
      } finally {
        setLoading(false)
      }
    }

    loadPark()
  }, [slug])
  // Fetch activities data
  // Fetch activities
  useEffect(() => {
    async function loadActivities() {
      try {
        if (park?._id) {
          console.log("Loading activities for park:", park._id)
          const activitiesData = await ActivityService.getActivitiesByParkId(park._id)
          console.log("Activities received:", activitiesData.data)
          setActivities(activitiesData.data)
        }
      } catch (error) {
        console.error("Failed to load activities:", error)
      }
    }

    if (park) {
      loadActivities()
    }
  }, [park])

  if (!park) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-3xl font-bold">Park Not Found</h1>
        <p className="mt-4">The park you're looking for doesn't exist or has been removed.</p>
        <Button className="mt-6" asChild>
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    )
  }

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
        title="Réservez Votre Aventure"
        description="Choisissez parmi nos activités passionnantes et réservez dès maintenant pour une expérience inoubliable."
        videoSrc={park.headerMedia}
        backgroundOverlay={true}
        height="medium"
        align="center"
      >
        <Button size="lg" asChild>
          <Link href={`/park/${slug}/reserver`}>Book Now</Link>
        </Button>
      </HeroSection>

      {/* Rest of the activities page content */}
      <div className="container mx-auto py-12">
        <h2 className="text-2xl font-bold mb-4">activities Details</h2>
        <ActivityDetailsAttachment slug={slug} />
      </div>
    </div>
  )
}
