"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, CheckCircle, Clock, ImageIcon, Loader2, Video, XCircle } from "lucide-react"
import Image from "next/image"
import { ActivityService } from "@/services/activity-service"
import { ParkService } from "@/services/park-service"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "../ui/button"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import type { Activity, Category, SubParcours, Feature } from "@/types/activity"
import type { Park } from "@/types/Park"

// CategoryContent Component
function CategoryContent({ category }: { category: Category }) {
  const [selectedImage, setSelectedImage] = useState(category.images?.[0] || null)

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Images Gallery Section */}
      {category.images && category.images.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3 md:mb-4">
            <ImageIcon className="w-4 h-4 md:w-5 md:h-5" />
            <h3 className="text-xl md:text-2xl font-bold">Gallery</h3>
          </div>

          {/* Main selected image */}
          <div className="relative w-full h-48 sm:h-56 md:h-64 lg:h-80 mb-3 md:mb-4 rounded-lg overflow-hidden">
            {selectedImage && (
              <Image src={selectedImage || "/placeholder.svg"} alt={category.name} fill className="object-cover" />
            )}
          </div>

          {/* Thumbnails */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {category.images.map((img, index) => (
              <div
                key={index}
                className={`relative h-14 sm:h-16 md:h-20 rounded-md overflow-hidden cursor-pointer transition-all ${
                  selectedImage === img ? "ring-2 ring-amber-500 scale-95" : "hover:scale-95"
                }`}
                onClick={() => setSelectedImage(img)}
              >
                <Image
                  src={img || "/placeholder.svg"}
                  alt={`${category.name} thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  crossOrigin="anonymous"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Video Section (Optional) */}
      {category.video && (
        <div>
          <div className="flex items-center gap-2 mb-3 md:mb-4">
            <Video className="w-4 h-4 md:w-5 md:h-5" />
            <h3 className="text-xl md:text-2xl font-bold">Video</h3>
          </div>
          <div className="relative w-full aspect-video rounded-lg overflow-hidden">
            <video src={category.video} controls crossOrigin="anonymous" className="w-full h-full object-cover">
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}

      {/* Category Description */}
      <div className="bg-amber-50 p-4 md:p-6 rounded-lg shadow-md">
        <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-3">About this Category</h3>
        <p className="text-sm md:text-base">{category.descriptionofCategory}</p>
      </div>
    </div>
  )
}

// SubParcoursContent Component
function SubParcoursContent({ subParcours }: { subParcours: SubParcours[] }) {
  return (
    <div className="space-y-6 md:space-y-8">
      <h3 className="text-xl md:text-2xl font-bold">Sub-Parcours</h3>
      <div className="grid grid-cols-1 gap-4 md:gap-6">
        {subParcours.map((parcours, index) => (
          <Card key={index} className="border-l-4 border-l-blue-500 overflow-hidden">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-lg md:text-xl">{parcours.name || `Trail ${index + 1}`}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="px-2 py-1 text-xs md:text-sm bg-blue-50">
                    Workshops: {parcours.numberOfWorkshops || 0}
                  </Badge>
                  <Badge variant="outline" className="px-2 py-1 text-xs md:text-sm bg-blue-50">
                    Tyroliennes: {parcours.tyroliennes || 0}
                  </Badge>
                </div>
                <p className="text-sm md:text-base">{parcours.description || "No description available."}</p>
              </div>

              {/* Display sub-parcours images if available */}
              {parcours.images && parcours.images.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Trail Images</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {parcours.images.map((img, imgIndex) => (
                      <div key={imgIndex} className="relative h-24 md:h-32 rounded-md overflow-hidden">
                        <Image
                          src={img || "/placeholder.svg"}
                          alt={`${parcours.name || `Trail ${index + 1}`} image ${imgIndex + 1}`}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-300"
                          crossOrigin="anonymous"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Display video if available */}
              {parcours.video && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Trail Video</h4>
                  <div className="relative w-full aspect-video rounded-md overflow-hidden">
                    <video
                      src={parcours.video}
                      controls
                      poster={parcours.images?.[0]}
                      className="w-full h-full object-cover"
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ActivityDetails Component
function ActivityDetailsSection({ activity, category }: { activity: Activity; category?: Category }) {
  const { déroulement, duration, features } = activity.details

  // Add the getDifficultyColor function here
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

  // Different background colors based on activity type
  const bgColor = activity.isParcours ? "bg-blue-50" : "bg-amber-50"
  const accentColor = activity.isParcours ? "blue" : "amber"
  const titleColor = activity.isParcours ? "text-blue-900" : "text-amber-900"

  return (
    <div className="mt-6 md:mt-8">
      <h3 className={`text-xl md:text-2xl font-bold mb-4 md:mb-6 text-center ${titleColor}`}>
        {activity.isParcours ? "Parcours Information" : "Activity Information"}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto p-3 md:p-4 bg-transparent w-full">
        {/* Section 1: Le déroulement with Requirements */}
        <div
          className={`${activity.isParcours ? "bg-blue-100" : "bg-orange-100"} text-gray-900 p-4 md:p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow`}
        >
          <h2 className={`text-lg md:text-2xl font-bold ${titleColor} mb-2 md:mb-3`}>Le déroulement</h2>
          <p className="text-sm md:text-base mb-3 md:mb-4">{déroulement}</p>

          {/* Requirements integrated here - only for non-parcours */}
          {!activity.isParcours && category && (
            <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-orange-200">
              <h3 className="font-bold text-blue-900 mb-2 text-sm md:text-base">Requirements</h3>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="px-2 py-1 text-xs md:text-sm bg-white/50">
                  Age: {category.ageRequirement}
                </Badge>
                <Badge variant="outline" className="px-2 py-1 text-xs md:text-sm bg-white/50">
                  Height: {category.heightRequirement}
                </Badge>
              </div>
            </div>
          )}

          {/* Difficulty section (only for parcours type) - moved inside this card */}
          {activity.isParcours && activity.difficulty && (
            <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-blue-200">
              <h3 className="font-bold text-blue-900 mb-2 text-sm md:text-base">Difficulty Level</h3>
              <Badge
                className={`${getDifficultyColor(activity.difficulty?.level || "medium")} text-xs md:text-sm px-2 py-1`}
              >
                {activity.difficulty?.level
                  ? activity.difficulty.level.charAt(0).toUpperCase() + activity.difficulty.level.slice(1)
                  : "Medium"}
              </Badge>
              <p className="mt-2 text-xs md:text-sm">
                {activity.difficulty?.description || "Standard difficulty level suitable for most participants."}
              </p>
            </div>
          )}
        </div>

        {/* Section 2: Duration */}
        <div
          className={`${activity.isParcours ? "bg-green-100" : "bg-green-50"} text-gray-900 p-4 md:p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow`}
        >
          <h2 className="text-lg md:text-2xl font-bold text-green-900 mb-2 md:mb-3">La durée</h2>
          <p className="text-sm md:text-base mb-3 md:mb-4">{duration}</p>

          {/* Duration from category - only for non-parcours */}
          {!activity.isParcours && category && (
            <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-green-200">
              <h3 className="font-bold text-green-900 mb-2 text-sm md:text-base">Estimated Duration</h3>
              <Badge variant="outline" className="px-2 py-1 text-xs md:text-sm flex items-center gap-1 bg-white/50">
                <Clock className="w-3 h-3 md:w-4 md:h-4" />
                <span>{category.durationEstimated}</span>
              </Badge>
            </div>
          )}

          {/* For parcours, show workshops and tyroliennes count if available */}
          {activity.isParcours && activity.subParcours && activity.subParcours.length > 0 && (
            <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-green-200">
              <h3 className="font-bold text-green-900 mb-2 text-sm md:text-base">Trail Details</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs md:text-sm">Trails:</span>
                  <Badge variant="outline" className="px-2 py-1 text-xs md:text-sm bg-white/50">
                    {activity.subParcours.length}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs md:text-sm">Total Workshops:</span>
                  <Badge variant="outline" className="px-2 py-1 text-xs md:text-sm bg-white/50">
                    {activity.subParcours.reduce((total, parcours) => total + (parcours.numberOfWorkshops || 0), 0)}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs md:text-sm">Total Tyroliennes:</span>
                  <Badge variant="outline" className="px-2 py-1 text-xs md:text-sm bg-white/50">
                    {activity.subParcours.reduce((total, parcours) => total + (parcours.tyroliennes || 0), 0)}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Rules */}
        <div
          className={`${activity.isParcours ? "bg-blue-50" : "bg-gray-100"} p-4 md:p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow`}
        >
          <h2
            className={`text-lg md:text-2xl font-bold ${activity.isParcours ? "text-blue-900" : "text-red-900"} mb-2 md:mb-3`}
          >
            Les règles
          </h2>
          <ul className="space-y-2 md:space-y-3 text-gray-700 text-sm md:text-base">
            {features && features.map((feature, index) => <li key={index}>✅ {feature}</li>)}
          </ul>
          <button
            className={`mt-3 md:mt-4 ${activity.isParcours ? "bg-blue-500 hover:bg-blue-600" : "bg-red-500 hover:bg-red-600"} text-white px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm rounded-lg shadow-md transition`}
          >
            Consulter le règlement intérieur
          </button>
        </div>
      </div>
    </div>
  )
}

// Features Component (can be used for both activity types)
function FeaturesSection({ features, isParcours }: { features?: Feature[]; isParcours?: boolean }) {
  const [showFeatures, setShowFeatures] = useState(false)

  if (!features || features.length === 0) {
    return null
  }

  // Set button color based on activity type
  const buttonBgColor = isParcours ? "bg-blue-500 hover:bg-blue-600" : "bg-amber-500 hover:bg-amber-600"

  return (
    <div className="mt-6 md:mt-8">
      {/* Features Button */}
      <div className="flex justify-center">
        <button
          onClick={() => setShowFeatures(!showFeatures)}
          className={`${buttonBgColor} text-white px-4 py-2 md:px-6 md:py-3 text-sm md:text-base rounded-lg shadow-lg transition-all flex items-center gap-2`}
        >
          {showFeatures ? "Hide Features" : "View Features"}
          {showFeatures ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4 md:w-5 md:h-5"
            >
              <path d="m18 15-6-6-6 6" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4 md:w-5 md:h-5"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          )}
        </button>
      </div>

      {/* Features Grid (Expandable) */}
      {showFeatures && (
        <div className="animate-fadeIn mt-4 md:mt-6">
          <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Features</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            {features.map((feature, index) => (
              <Card key={index} className={`border-l-4 ${isParcours ? "border-l-blue-500" : "border-l-amber-500"}`}>
                <CardHeader className="p-3 md:p-4 pb-1 md:pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base md:text-xl">{feature.feature}</CardTitle>
                    {feature.available ? (
                      <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 md:w-5 md:h-5 text-red-600" />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-3 md:p-4 pt-1 md:pt-2">
                  <p className="text-sm md:text-base">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ActivityContent Component
function ActivityContent({ activity }: { activity: Activity }) {
  const [activeCategory, setActiveCategory] = useState("")
  const [activeSubParcours, setActiveSubParcours] = useState("")

  // Set initial active category or subParcours when activity changes
  useEffect(() => {
    if (activity.isParcours && activity.subParcours?.length > 0) {
      setActiveSubParcours(activity.subParcours[0]._id || "0")
    } else if (!activity.isParcours && activity.categories?.length > 0) {
      setActiveCategory(activity.categories[0]._id || "0")
    }
  }, [activity])

  // Find the active category object
  const currentCategory =
    !activity.isParcours && activity.categories?.length > 0
      ? activity.categories.find((cat) => cat._id === activeCategory) || activity.categories[0]
      : undefined

  // Set background gradient based on activity type
  const bgGradient = activity.isParcours
    ? "bg-gradient-to-b from-blue-50 to-blue-100"
    : "bg-gradient-to-b from-amber-50 to-amber-100"

  return (
    <div className={`w-full h-full overflow-auto rounded-xl md:rounded-2xl ${bgGradient} p-3 sm:p-4 md:p-6 text-black`}>
      <div className="max-w-4xl mx-auto">
        {/* Header Image Section */}
        <div className="mb-6 md:mb-8">
          <div className="relative w-full h-48 sm:h-64 md:h-80 lg:h-96 rounded-xl overflow-hidden shadow-lg">
            {activity.HeaderVideo ? (
              <video
                src={activity.HeaderVideo}
                poster={activity.HeaderImage || "/placeholder.svg"}
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
                autoPlay
                loop
              />
            ) : (
              <Image
                src={activity.HeaderImage || "/placeholder.svg"}
                alt={activity.name}
                fill
                className="object-cover"
                priority
                crossOrigin="anonymous"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4 md:p-6">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 drop-shadow-md">
                {activity.name}
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={`${activity.isParcours ? "bg-blue-500" : "bg-amber-500"} text-xs md:text-sm`}>
                  {activity.isParcours ? "Parcours" : "Activity"}
                </Badge>
                {activity.description && (
                  <p className="text-sm md:text-base text-white/90 drop-shadow-md">{activity.description}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Images Gallery - Only if there are additional images */}
        {activity.images && activity.images.length > 0 && (
          <div className="mb-6 md:mb-8">
            <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Gallery</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-3">
              {activity.images.map((img, index) => (
                <div key={index} className="relative h-24 md:h-32 rounded-md overflow-hidden shadow-md">
                  <Image
                    src={img || "/placeholder.svg"}
                    alt={`${activity.name} image ${index + 1}`}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                    crossOrigin="anonymous"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Display based on activity type */}
        {activity.isParcours ? (
          // Parcours type content
          <>
            {activity.subParcours && activity.subParcours.length > 0 ? (
              <SubParcoursContent subParcours={activity.subParcours} />
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No Sub-Parcours</AlertTitle>
                <AlertDescription>This parcours doesn't have any sub-parcours defined.</AlertDescription>
              </Alert>
            )}
            <FeaturesSection features={activity.features} isParcours={activity.isParcours} />
            <ActivityDetailsSection activity={activity} />
          </>
        ) : (
          // Regular activity type content with categories
          <>
            {activity.categories && activity.categories.length > 0 ? (
              <Tabs
                defaultValue={activity.categories[0]?._id || "0"}
                className="w-full"
                onValueChange={setActiveCategory}
              >
                <TabsList className="w-full overflow-x-auto flex-nowrap justify-start mb-4 md:mb-6 bg-amber-100/50 p-1 rounded-lg">
                  {activity.categories.map((category) => (
                    <TabsTrigger
                      key={category._id || `cat-${Math.random()}`}
                      value={category._id || "0"}
                      className="data-[state=active]:bg-amber-200 data-[state=active]:text-amber-900 text-xs md:text-sm whitespace-nowrap"
                    >
                      {category.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {activity.categories.map((category) => (
                  <TabsContent key={category._id || `content-${Math.random()}`} value={category._id || "0"}>
                    <CategoryContent category={category} />
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No Categories</AlertTitle>
                <AlertDescription>This activity doesn't have any categories.</AlertDescription>
              </Alert>
            )}
            <FeaturesSection features={activity.features} isParcours={activity.isParcours} />
            {currentCategory && <ActivityDetailsSection activity={activity} category={currentCategory} />}
          </>
        )}
      </div>
    </div>
  )
}

// Main Component
export function ActivityDetailsAttachment({ slug }: { slug: string }) {
  // Get query parameters
  const searchParams = useSearchParams()
  const activityId = searchParams.get("activityId")

  // Park state
  const [park, setPark] = useState<Park | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const oldpath = usePathname() // Récupère l'URL actuelle
  const path = oldpath.replace("/activity", "")

  // Activities state
  const [activities, setActivities] = useState<Activity[]>([])
  const [selectedActivity, setSelectedActivity] = useState<string>("")
  const [activitiesLoading, setActivitiesLoading] = useState<boolean>(false)
  const [activitiesError, setActivitiesError] = useState<string | null>(null)

  // Fetch park by slug/id
  useEffect(() => {
    async function loadPark() {
      try {
        setLoading(true)
        setError(null)

        if (slug) {
          console.log("Loading park with slug:", slug)
          const parkData = await ParkService.getParkById(slug)
          console.log("Park data received:", parkData)

          if (parkData?.data) {
            setPark(parkData.data)
          } else {
            setError("Park not found")
          }
        } else {
          setError("Park ID is missing")
          console.error("Park slug is undefined")
        }
      } catch (error: any) {
        console.error("Failed to load park:", error)
        setError(error.message || "Failed to load park")
      } finally {
        setLoading(false)
      }
    }

    loadPark()
  }, [slug])

  // Fetch activities when park is loaded
  useEffect(() => {
    async function fetchActivities() {
      if (!park?._id) return

      try {
        setActivitiesLoading(true)
        setActivitiesError(null)

        const res = await ActivityService.getActivitiesByParkId(park._id)
        const data = res.data
        console.log(Array.isArray(data), data)

        // Check if we got valid data
        if (Array.isArray(data) && data.length > 0) {
          setActivities(data)

          // Check if there's an activityId in the URL and if it belongs to this park
          if (activityId) {
            const matchingActivity = data.find((activity) => activity._id === activityId)
            if (matchingActivity) {
              // If the activity exists in this park, set it as selected
              setSelectedActivity(activityId)
              console.log(`Setting activity with ID ${activityId} as selected`)
            } else {
              // If not found, use the first activity
              setSelectedActivity(data[0]._id)
              console.log(`Activity with ID ${activityId} not found in this park, using default`)
            }
          } else {
            // No activityId in URL, use the first activity
            setSelectedActivity(data[0]._id)
          }
        } else {
          setActivities([])
          setActivitiesError("No activities found for this park")
        }
      } catch (err: any) {
        console.error("Error fetching activities:", err)
        setActivitiesError(err.message || "Failed to load activities. Please try again later.")
        setActivities([])
      } finally {
        setActivitiesLoading(false)
      }
    }

    fetchActivities()
  }, [park, activityId])

  // Find the currently selected activity
  const currentActivity = activities.find((activity) => activity._id === selectedActivity)

  // Combined loading state
  const isLoading = loading || activitiesLoading

  return (
    <div className="relative flex flex-col w-full max-w-5xl mx-auto items-start justify-start my-4 sm:my-8 md:my-12 lg:my-16 min-h-[30rem] md:min-h-[40rem]">
      {/* Sticky header with title and Book Now button */}
      <div className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-sm py-3 px-3 sm:py-4 sm:px-4 mb-4 sm:mb-6 md:mb-8 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0">
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center sm:text-left">Our Activities</h2>
          {park && <p className="text-muted-foreground text-sm md:text-base text-center sm:text-left">{park.name}</p>}
        </div>
        <Link href={`${path}/reserver`}>
          <Button size="sm" className="md:text-base md:px-6 md:py-2.5" variant="secondary">
            Book Your Visit Now
          </Button>
        </Link>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="w-full h-64 flex items-center justify-center">
          <Loader2 className="w-6 h-6 md:w-8 md:h-8 animate-spin text-amber-500" />
          <span className="ml-2 text-sm md:text-base">
            {loading ? "Loading park information..." : "Loading activities..."}
          </span>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <Alert variant="destructive" className="w-full mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Activities error state */}
      {!loading && !error && !activitiesLoading && activitiesError && (
        <Alert variant="destructive" className="w-full mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{activitiesError}</AlertDescription>
        </Alert>
      )}

      {/* Activity Tabs */}
      {!isLoading && !error && !activitiesError && activities.length > 0 && (
        <Tabs defaultValue={selectedActivity} className="w-full" onValueChange={(value) => setSelectedActivity(value)}>
          <TabsList className="w-full overflow-x-auto flex-nowrap justify-start mb-4 md:mb-6 bg-amber-100/50 p-1 rounded-lg">
            {activities.map((activity) => (
              <TabsTrigger
                key={activity._id}
                value={activity._id}
                className="data-[state=active]:bg-amber-200 data-[state=active]:text-amber-900 text-xs md:text-sm whitespace-nowrap"
              >
                {activity.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {activities.map((activity) => (
            <TabsContent key={activity._id} value={activity._id}>
              <ActivityContent activity={activity} />
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* No activities state */}
      {!isLoading && !error && !activitiesError && activities.length === 0 && (
        <Alert className="w-full">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Activities</AlertTitle>
          <AlertDescription>No activities found for this park. Please check back later.</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

export default ActivityDetailsAttachment
