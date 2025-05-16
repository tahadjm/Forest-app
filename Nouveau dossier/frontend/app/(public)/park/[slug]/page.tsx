"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Clock, MapPin, Calendar, ArrowRight, ImageIcon, Timer } from "lucide-react"

import { ParkService } from "@/services/park-service"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { HeroSection } from "@/components/ui/hero-section"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ActivityService } from "@/services/activity-service"
import Image from "next/image"
import type { Activity } from "@/types/activity"
import type { Park } from "@/types/Park"

type WorkingHour = {
  from?: string
  to?: string
  closed: boolean
}

export default function ParkPage() {
  const path = usePathname() // Récupère l'URL actuelle
  const [activities, setActivities] = useState<Activity[]>([])
  const params = useParams()
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug
  const [park, setPark] = useState<Park | null>(null)
  const [workingHours, setWorkingHours] = useState<Record<string, WorkingHour> | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)

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

  useEffect(() => {
    async function loadWorkingHours() {
      try {
        if (slug) {
          console.log("Loading working hours for park:", slug)
          const hoursData = await ParkService.getWorkingHours(slug)
          console.log("Working hours received:", hoursData)
          setWorkingHours(hoursData)
        }
      } catch (error) {
        console.error("Failed to load working hours:", error)
      }
    }

    if (park) {
      loadWorkingHours()
    }
  }, [park])

  // Format working hours for display
  const formatWorkingHours = (workingHours: Record<string, WorkingHour> | null | undefined) => {
    if (!workingHours) {
      return [] // Return empty array if workingHours is undefined
    }

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    return days.map((day) => {
      const hours = workingHours[day] // Use object notation instead of Map.get()
      return {
        day,
        hours: hours?.closed ? "Closed" : `${hours?.from || "N/A"} - ${hours?.to || "N/A"}`,
      }
    })
  }
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
      case "hard":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

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

  const workingHoursFormatted = formatWorkingHours(workingHours)

  console.log("Park data:", park)
  console.log("media:", park.headerMedia)

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section with standardized component */}
      <HeroSection title={park.name} description={park.description} videoSrc={park.headerMedia} height="large">
        <Badge className="mb-4 text-lg px-4 py-1">{park.location}</Badge>
        <Link href={`${path}/reserver`}>
          <Button size="lg" className="mt-4">
            Book Your Visit <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </HeroSection>

      {/* Park Information Section */}
      <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-6">Discover {park.name}</h2>
            <p className="text-muted-foreground mb-6">{park.description}</p>

            <div className="flex items-center mb-4">
              <MapPin className="h-5 w-5 text-primary mr-2" />
              <span>{park.location}</span>
            </div>

            <div className="flex items-center mb-4">
              <Calendar className="h-5 w-5 text-primary mr-2" />
              <span>Book up to {park.maxBookingDays} days in advance</span>
            </div>

            <Button className="mt-4">View on Map</Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative rounded-xl overflow-hidden aspect-square md:aspect-video"
          >
            <Image
              src={park.imageUrl || "/placeholder.svg"}
              crossOrigin="anonymous"
              alt={park.name}
              className="w-full h-full object-cover"
              width={1200}
              height={800}
            />
          </motion.div>
        </div>
      </section>
      {/* Activities Section - All activities use a single reservation page with pricing */}
      <section className="py-16 bg-muted/30">
        <div className="px-4 md:px-8 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold">Exciting Activities</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              Discover a wide range of thrilling activities available at {park.name}. From adrenaline-pumping adventures
              to relaxing experiences, there's something for everyone.
            </p>
          </motion.div>

          {activities.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {activities.map((activity, index) => (
                <motion.div
                  key={activity._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full flex flex-col overflow-hidden group">
                    <div className="relative overflow-hidden h-48">
                      <Image
                        src={activity.HeaderImage || "/placeholder.svg"}
                        alt={activity.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        width={1200}
                        height={800}
                        crossOrigin="anonymous"
                      />
                      <div className="absolute top-3 right-3"></div>
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle>{activity.name}</CardTitle>
                      <CardDescription className="line-clamp-2">{activity.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-4 pt-0 flex-grow">
                      <div className="grid grid-cols-1 gap-2 text-sm">
                        <div className="flex items-center">
                          <Timer className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{activity.details?.duration}</span>
                        </div>

                        {activity.isParcours ? (
                          <div className="mt-2">
                            <Badge variant="outline" className="mb-1">
                              Parcours
                            </Badge>
                            <div className="flex items-center mt-1">
                              <span className="text-sm font-medium">
                                Sub-parcours: {activity.subParcours?.length || 0}
                              </span>
                            </div>
                            {activity.subParcours && activity.subParcours.length > 0 && (
                              <div className="mt-2">
                                <span className="text-xs text-muted-foreground">
                                  {activity.subParcours[0].tyroliennes > 0 &&
                                    `${activity.subParcours[0].tyroliennes} tyroliennes • `}
                                  {activity.subParcours[0].numberOfWorkshops > 0 &&
                                    `${activity.subParcours[0].numberOfWorkshops} workshops`}
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="mt-2">
                            <Badge variant="outline" className="mb-1">
                              Activity
                            </Badge>
                            <div className="flex items-center mt-1">
                              <span className="text-sm font-medium">
                                Categories: {activity.categories?.length || 0}
                              </span>
                            </div>
                            {activity.categories && activity.categories.length > 0 && (
                              <div className="mt-2">
                                <span className="text-xs text-muted-foreground">
                                  Age: {activity.categories[0].ageRequirement} • Height:{" "}
                                  {activity.categories[0].heightRequirement}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {activity.difficulty && (
                        <div className="mt-3">
                          <Badge className={`${getDifficultyColor(activity.difficulty.level)}`}>
                            {activity.difficulty.level.charAt(0).toUpperCase() + activity.difficulty.level.slice(1)}
                          </Badge>
                          {activity.difficulty.description && (
                            <p className="text-xs text-muted-foreground mt-1">{activity.difficulty.description}</p>
                          )}
                        </div>
                      )}

                      {activity.features && activity.features.length > 0 && (
                        <div className="mt-3">
                          <span className="text-xs font-medium">Features:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {activity.features.slice(0, 2).map((feature, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {feature.feature}
                              </Badge>
                            ))}
                            {activity.features.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{activity.features.length - 2} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="pt-0 mt-auto flex gap-2">
                      <Button variant="outline" className="flex-1" asChild>
                        <Link href={`${path}/activity?activityId=${activity._id}`}>More Details</Link>
                      </Button>
                      <Button className="flex-1" asChild>
                        <Link href={`${path}/reserver`}>Book Now</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="mt-4 text-muted-foreground">Loading activities...</p>
            </div>
          )}
        </div>
      </section>
      {/* Gallery Section */}
      <section className="py-16 bg-muted/50">
        <div className="px-4 md:px-8 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold">Park Gallery</h2>
            <p className="text-muted-foreground mt-2">Explore the beauty of {park.name}</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="rounded-xl overflow-hidden aspect-square"
            >
              <Image
                src={park.galleryImages[activeImage] || "/placeholder.svg"}
                alt={`${park.name} view ${activeImage + 1}`}
                className="w-full h-full object-cover transition-all duration-500"
                crossOrigin="anonymous"
                width={1200}
                height={800}
              />
            </motion.div>

            <div className="grid grid-cols-2 gap-4">
              {park.galleryImages?.length > 0 ? (
                park.galleryImages.map((img, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className={`rounded-lg overflow-hidden cursor-pointer aspect-square ${
                      activeImage === index ? "ring-4 ring-primary" : ""
                    }`}
                    onClick={() => setActiveImage(index)}
                  >
                    <Image
                      src={img || "/placeholder.svg"}
                      alt={`${park.name} thumbnail ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      crossOrigin="anonymous"
                      width={1200}
                      height={800}
                    />
                  </motion.div>
                ))
              ) : (
                <p>Aucune image disponible</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Information Tabs Section */}
      <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Tabs defaultValue="hours" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 mb-8">
              <TabsTrigger value="hours">Working Hours</TabsTrigger>
              <TabsTrigger value="facilities">Facilities</TabsTrigger>
              <TabsTrigger value="rules">Park Rules</TabsTrigger>
            </TabsList>

            <TabsContent value="hours">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="mr-2 h-5 w-5 text-primary" />
                    Working Hours
                  </CardTitle>
                  <CardDescription>Plan your visit to {park.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  {workingHours ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {workingHoursFormatted.map((day) => (
                        <div key={day.day} className="flex justify-between p-3 rounded-lg border">
                          <span className="font-medium">{day.day}</span>
                          <span className={day.hours === "Closed" ? "text-destructive" : ""}>{day.hours}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                      <p className="mt-2 text-muted-foreground">Loading working hours...</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="facilities">
              <Card>
                <CardHeader>
                  <CardTitle>Park Facilities</CardTitle>
                  <CardDescription>Amenities available at {park.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {park.facilities.map((facility) => (
                      <div key={facility} className="flex items-center p-3 rounded-lg border">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                          <ImageIcon className="h-4 w-4 text-primary" />
                        </div>
                        <span>{facility}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rules">
              <Card>
                <CardHeader>
                  <CardTitle>Park Rules</CardTitle>
                  <CardDescription>Guidelines to follow during your visit</CardDescription>
                </CardHeader>
                <CardContent>
                  {park.rules && park.rules.length > 0 ? (
                    <ul className="space-y-3">
                      {park.rules.map((rule, index) => (
                        <li key={index} className="flex items-start">
                          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mr-3 mt-0.5">
                            <span className="text-xs font-bold text-primary">{index + 1}</span>
                          </div>
                          <span>{rule.ruleNumber}</span>
                          <span>{rule.description}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">No specific rules available.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="px-4 md:px-8 max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-4">Ready to Experience {park.name}?</h2>
            <p className="max-w-2xl mx-auto mb-8">
              Book your visit now and create unforgettable memories in one of our most beautiful natural spaces.
            </p>
            <Link href={`${path}/reserver`}>
              <Button size="lg" variant="secondary">
                Book Your Visit Now
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
