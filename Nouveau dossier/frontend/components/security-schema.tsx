"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { motion, useInView, useAnimation } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Clipboard, HardHat, Link, BookOpen, Siren, TreePine } from "lucide-react"
import type { SecuritySection } from "@/types/security"
import { SecuritySectionService } from "@/services/content-service"
import Image from "next/image"

interface SecuritySectionProps {
  title: string
  description: string
  iconName: React.ReactNode
  imageUrl: string
  order: number
  totalSections: number
}

// Helper function to convert icon name string to component
const getIconComponent = (iconName: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    Shield: <Shield className="h-8 w-8 text-orange-400" />,
    Clipboard: <Clipboard className="h-8 w-8 text-orange-400" />,
    HardHat: <HardHat className="h-8 w-8 text-orange-400" />,
    Link: <Link className="h-8 w-8 text-orange-400" />,
    BookOpen: <BookOpen className="h-8 w-8 text-orange-400" />,
    Siren: <Siren className="h-8 w-8 text-orange-400" />,
    TreePine: <TreePine className="h-8 w-8 text-orange-400" />,
  }

  return iconMap[iconName] || <Shield className="h-8 w-8 text-orange-400" />
}

// Fallback data in case API fails
const fallbackSecuritySections = [
  {
    title: "Equipment Inspection & Maintenance",
    description:
      "Daily checks of all PPE including harnesses, pulleys, and carabiners. Annual third-party inspections following European standards.",
    iconName: "Shield",
    imageUrl: "/image/image.jpg",
  },
  {
    title: "Safety Briefing & Test Course",
    description: "Mandatory comprehensive safety briefing and supervised test run to ensure proper equipment handling.",
    iconName: "Clipboard",
    imageUrl: "/image/image.jpg",
  },
  {
    title: "Personal Protective Equipment (PPE)",
    description:
      "Trained operators adjust and fit PPE. Participants must wear closed shoes and required protective gear.",
    iconName: "HardHat",
    imageUrl: "/image/image.jpg",
  },
  {
    title: "Continuous Lifeline & Fall Arrest Systems",
    description:
      "Continuous lifeline system ensures participants remain connected at all times with automatic locking carabiner systems.",
    iconName: "Link",
    imageUrl: "/image/image.jpg",
  },
  {
    title: "Operational Rules & Guidelines",
    description:
      "Clear criteria for age, height, and weight. Behavioral guidelines displayed along the route with prominent signage.",
    iconName: "BookOpen",
    imageUrl: "/image/image.jpg",
  },
  {
    title: "Emergency Preparedness",
    description:
      "Established evacuation protocols and regular staff training in emergency response and rescue techniques.",
    iconName: "Siren",
    imageUrl: "/image/image.jpg",
  },
  {
    title: "Course Design & Environmental Integration",
    description:
      "Courses designed to work with the natural environment, minimizing risks while preserving tree health with routine maintenance.",
    iconName: "TreePine",
    imageUrl: "/image/image.jpg",
  },
]

function SecuritySection({ title, description, iconName, imageUrl, order, totalSections }: SecuritySectionProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })
  const controls = useAnimation()

  useEffect(() => {
    if (isInView) {
      controls.start("visible")
    }
  }, [isInView, controls])

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 50 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.6,
            delay: order * 0.2,
          },
        },
      }}
      className="mb-16"
    >
      <div className={`flex flex-col ${order % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} gap-8 items-center`}>
        <div className="w-full md:w-1/2">
          <Card className="border-orange-200 shadow-lg h-full">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              {iconName}
              <CardTitle className="text-xl text-orange-500">{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base text-gray-700">{description}</CardDescription>
            </CardContent>
          </Card>
        </div>
        <div className="w-full md:w-1/2">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: order * 0.2 + 0.3 }}
            className="rounded-lg overflow-hidden shadow-xl"
          >
            <Image
              src={imageUrl || "/placeholder.svg"}
              alt={`Illustration for ${title}`}
              width={600}
              height={400}
              className="w-full h-auto object-cover rounded-lg"
              crossOrigin="anonymous"
              loading="lazy"
            />
          </motion.div>
        </div>
      </div>
      {order < totalSections && (
        <div className="flex justify-center my-8">
          <motion.div
            initial={{ height: 0 }}
            animate={isInView ? { height: 50 } : {}}
            transition={{ duration: 0.5, delay: order * 0.2 + 0.6 }}
            className="w-1 bg-orange-300 rounded-full"
          />
        </div>
      )}
    </motion.div>
  )
}

export default function SecuritySchema() {
  const [securityData, setSecurityData] = useState<SecuritySection[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchSecurityData() {
      try {
        setIsLoading(true)
        const response = await SecuritySectionService.getSections()

        if (response && response.length > 0) {
          setSecurityData(response)
        } else {
          // Use fallback data if API returns empty array
          setSecurityData(fallbackSecuritySections)
        }
      } catch (error) {
        console.error("Failed to fetch security data:", error)
        // Use fallback data if API call fails
        setSecurityData(fallbackSecuritySections)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSecurityData()
  }, [])

  if (isLoading) {
    return <div className="flex justify-center py-20">Loading security information...</div>
  }

  return (
    <div className="relative">
      <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-gray-200 -translate-x-1/2 z-0 hidden md:block" />
      <div className="relative z-10">
        {securityData.map((section, index) => (
          <SecuritySection
            key={index}
            title={section.title}
            description={section.description}
            iconName={typeof section.iconName === "string" ? getIconComponent(section.iconName) : section.iconName}
            imageUrl={section.imageUrl}
            order={index}
          />
        ))}
      </div>
    </div>
  )
}
