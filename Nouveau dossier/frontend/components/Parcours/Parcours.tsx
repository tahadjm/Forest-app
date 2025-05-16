"use client"

import { HeroSection } from "@/components/ui/hero-section"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export function Parcours() {
  const parcoursList = [
    {
      id: "1",
      name: "Beginner Trail",
      description: "Perfect for first-timers and families with young children",
      difficulty: "easy",
      duration: "1 hour",
      minAge: 6,
      image: "/placeholder.svg?height=400&width=600",
    },
    {
      id: "2",
      name: "Adventure Circuit",
      description: "A balanced mix of challenges for those with some experience",
      difficulty: "medium",
      duration: "2 hours",
      minAge: 10,
      image: "/placeholder.svg?height=400&width=600",
    },
    {
      id: "3",
      name: "Extreme Challenge",
      description: "Test your limits with our most demanding obstacles",
      difficulty: "hard",
      duration: "3 hours",
      minAge: 16,
      image: "/placeholder.svg?height=400&width=600",
    },
  ]

  const getDifficultyColor = (difficulty) => {
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

  return (
    <section className="w-full py-12 md:py-24">
      <HeroSection
        title="Adventure Courses"
        description="Explore our range of exciting courses for all skill levels"
        backgroundType="color"
        height="small"
        className="mb-12"
      />

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {parcoursList.map((parcours) => (
            <Card key={parcours.id} className="overflow-hidden">
              <div className="relative h-48">
                <Image src={parcours.image || "/placeholder.svg"} alt={parcours.name} fill className="object-cover" />
                <Badge className={`absolute top-3 right-3 ${getDifficultyColor(parcours.difficulty)}`}>
                  {parcours.difficulty.charAt(0).toUpperCase() + parcours.difficulty.slice(1)}
                </Badge>
              </div>
              <CardHeader>
                <CardTitle>{parcours.name}</CardTitle>
                <CardDescription>{parcours.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Duration:</span>
                    <p className="font-medium">{parcours.duration}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Min Age:</span>
                    <p className="font-medium">{parcours.minAge}+ years</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={`/parcours/${parcours.id}`}>
                    View Details <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button size="lg" variant="outline" asChild>
            <Link href="/parcours">
              View All Courses <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
