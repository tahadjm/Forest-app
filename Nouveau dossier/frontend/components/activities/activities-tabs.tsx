"use client"
import { ActivityContent } from "./activity-content"
import { Tabs } from "../tabs/tabs"
import Booknow from "@/components/Booknow/Booknow"

// Sample activities data based on the provided schema
const activitiesData = [
  {
    _id: { $oid: "67b6f524622358071dd4f3a0" },
    name: "Quad",
    parkId: { $oid: "67b6f470d2ede893b557df09" },
    description:
      "Experience the thrill of quad biking with options for all ages and skill levels. From beginner-friendly trails to challenging terrain for experienced riders.",
    categories: [
      {
        name: "Adult Quad",
        ageRequirement: "16+",
        heightRequirement: "Minimum 1.5m",
        durationEstimated: "2 hours",
        descriptionofCategory: "Full-size quad bikes for adults and experienced riders.",
        _id: { $oid: "67b6f524622358071dd4f3a1" },
        features: [
          {
            features: "Powerful Engines",
            description: "High-performance quads for an exciting riding experience.",
            available: true,
            _id: { $oid: "67b6f524622358071dd4f3a2" },
          },
          {
            features: "Advanced Trails",
            description: "Challenging routes for experienced riders.",
            available: true,
            _id: { $oid: "67b6f524622358071dd4f3a3" },
          },
        ],
        images: [
          "/placeholder.svg?height=600&width=800&text=Adult+Quad+1",
          "/placeholder.svg?height=600&width=800&text=Adult+Quad+2",
          "/placeholder.svg?height=600&width=800&text=Adult+Quad+3",
        ],
        video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      },
      {
        name: "Teen Quad",
        ageRequirement: "12-15",
        heightRequirement: "Minimum 1.3m",
        durationEstimated: "1.5 hours",
        descriptionofCategory: "Medium-sized quads perfect for teenagers.",
        _id: { $oid: "67b6f524622358071dd4f3a4" },
        features: [
          {
            features: "Speed Limited",
            description: "Controlled speed for safety while maintaining excitement.",
            available: true,
            _id: { $oid: "67b6f524622358071dd4f3a5" },
          },
          {
            features: "Intermediate Trails",
            description: "Balanced difficulty for developing skills.",
            available: true,
            _id: { $oid: "67b6f524622358071dd4f3a6" },
          },
        ],
        images: [
          "/placeholder.svg?height=600&width=800&text=Teen+Quad+1",
          "/placeholder.svg?height=600&width=800&text=Teen+Quad+2",
          "/placeholder.svg?height=600&width=800&text=Teen+Quad+3",
        ],
      },
      {
        name: "Kids Quad",
        ageRequirement: "6-11",
        heightRequirement: "Minimum 1.1m",
        durationEstimated: "1 hour",
        descriptionofCategory: "Mini quads designed specifically for children.",
        _id: { $oid: "67b6f524622358071dd4f3a7" },
        features: [
          {
            features: "Safety Controls",
            description: "Parent-controlled speed limiters and emergency stop.",
            available: true,
            _id: { $oid: "67b6f524622358071dd4f3a8" },
          },
          {
            features: "Beginner Trails",
            description: "Safe and easy paths for learning.",
            available: true,
            _id: { $oid: "67b6f524622358071dd4f3a9" },
          },
        ],
        images: [
          "/placeholder.svg?height=600&width=800&text=Kids+Quad+1",
          "/placeholder.svg?height=600&width=800&text=Kids+Quad+2",
          "/placeholder.svg?height=600&width=800&text=Kids+Quad+3",
        ],
        video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      },
    ],
  },
  {
    _id: { $oid: "67b6f524622358071dd4f3b0" },
    name: "Laser Game",
    parkId: { $oid: "67b6f470d2ede893b557df09" },
    description: "Enter the world of laser tag with different game modes and arenas suitable for various age groups.",
    categories: [
      {
        name: "Team Battle",
        ageRequirement: "8+",
        heightRequirement: "Minimum 1.2m",
        durationEstimated: "30 minutes",
        descriptionofCategory: "Classic team-based laser tag battles.",
        _id: { $oid: "67b6f524622358071dd4f3b1" },
        features: [
          {
            features: "Team Scoring",
            description: "Real-time score tracking for both teams.",
            available: true,
            _id: { $oid: "67b6f524622358071dd4f3b2" },
          },
          {
            features: "Multiple Arenas",
            description: "Different themed battlegrounds to choose from.",
            available: true,
            _id: { $oid: "67b6f524622358071dd4f3b3" },
          },
        ],
        images: [
          "/placeholder.svg?height=600&width=800&text=Team+Battle+1",
          "/placeholder.svg?height=600&width=800&text=Team+Battle+2",
          "/placeholder.svg?height=600&width=800&text=Team+Battle+3",
        ],
        video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      },
      {
        name: "Solo Mission",
        ageRequirement: "10+",
        heightRequirement: "Minimum 1.2m",
        durationEstimated: "20 minutes",
        descriptionofCategory: "Individual player missions and challenges.",
        _id: { $oid: "67b6f524622358071dd4f3b4" },
        features: [
          {
            features: "Individual Scoring",
            description: "Personal performance tracking and rankings.",
            available: true,
            _id: { $oid: "67b6f524622358071dd4f3b5" },
          },
          {
            features: "Special Missions",
            description: "Unique objectives and challenges.",
            available: true,
            _id: { $oid: "67b6f524622358071dd4f3b6" },
          },
        ],
        images: [
          "/placeholder.svg?height=600&width=800&text=Solo+Mission+1",
          "/placeholder.svg?height=600&width=800&text=Solo+Mission+2",
        ],
      },
    ],
  },
]

export function ActivitiesTabs() {
  const tabs = activitiesData.map((activity) => ({
    title: activity.name,
    value: activity._id.$oid,
    content: <ActivityContent activity={activity} />,
  }))

  return (
    <div className="h-[40rem] md:h-[50rem] [perspective:1000px] relative flex flex-col max-w-5xl mx-auto w-full items-start justify-start my-20">
      {/* Sticky header with title and Book Now button */}
      <div className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-sm py-4 px-4 mb-8 flex justify-between items-center">
        <h2 className="text-3xl md:text-4xl font-bold">Our Activities</h2>
        <Booknow className="bg-amber-500 hover:bg-amber-600 text-white shadow-lg" />
      </div>

      <Tabs tabs={tabs} containerClassName="mb-8" activeTabClassName="bg-amber-200 dark:bg-amber-800" />
    </div>
  )
}
