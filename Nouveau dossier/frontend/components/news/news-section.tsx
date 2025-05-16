"use client"

import { HeroSection } from "@/components/ui/hero-section"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, ArrowRight, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState, useRef } from "react"
import { NewsService } from "@/services/index"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"

// Define the NewsSection type
export type NewsSection = {
  _id?: string
  title: string
  description: string
  date: string
  image: string
  locations: string[] // Array of strings
  categories: string[] // Array of strings
  createdAt?: Date
  updatedAt?: Date
}

export function NewsSection() {
  // State for news data, loading state, and error state
  const [news, setNews] = useState<NewsSection[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Progress bar for scroll tracking
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const scrollHeight = document.documentElement.scrollHeight
      const clientHeight = document.documentElement.clientHeight
      const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100
      const progressBar = document.querySelector(".progress-bar")
      if (progressBar) {
        progressBar.style.width = `${scrollPercentage}%`
      }
    }
    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  // Scroll handlers for horizontal scrolling
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: "smooth" })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: "smooth" })
    }
  }

  // Fetch news data from newsService
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch news data from your API or service
        const response = await NewsService.getNews()

        // Check if response is valid
        if (!response || !Array.isArray(response)) {
          throw new Error("Invalid response format")
        }

        // Map the response to the NewsSection type if needed
        const formattedNews: NewsSection[] = response.map((item) => ({
          _id: item._id || item.id || undefined,
          title: item.title || "",
          description: item.description || "",
          date: item.date || new Date(item.createdAt || Date.now()).toLocaleDateString(),
          image: item.image || "/placeholder.svg",
          locations: Array.isArray(item.locations) ? item.locations : [],
          categories: Array.isArray(item.categories) ? item.categories : item.category ? [item.category] : [],
          createdAt: item.createdAt ? new Date(item.createdAt) : undefined,
          updatedAt: item.updatedAt ? new Date(item.updatedAt) : undefined,
        }))

        setNews(formattedNews)
      } catch (error) {
        console.error("Error fetching news:", error)
        setError(error instanceof Error ? error.message : "Failed to fetch news data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchNews()
  }, [])

  return (
    <section className="w-full py-12 md:py-24">
      {/* Progress bar for scrolling */}
      <div className="fixed top-0 left-0 right-0 h-1 z-50 bg-muted">
        <div className="progress-bar h-full bg-primary w-0"></div>
      </div>

      <HeroSection
        title="Latest News & Updates"
        description="Stay informed about new attractions, events, and special offers"
        backgroundType="color"
        height="small"
        className="mb-12"
      />

      <div className="container mx-auto px-4">
        {/* Error message */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading state */}
        {isLoading ? (
          <div className="relative">
            <div
              className="flex overflow-x-auto pb-6 gap-6 snap-x snap-mandatory scrollbar-hide"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={`skeleton-${i}`}
                  className="min-w-[280px] sm:min-w-[320px] md:min-w-[350px] flex-shrink-0 snap-start"
                >
                  <Card className="h-full overflow-hidden">
                    <Skeleton className="h-48 w-full" />
                    <CardHeader>
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-6 w-full mb-2" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4 mt-2" />
                    </CardHeader>
                    <CardFooter>
                      <Skeleton className="h-10 w-full" />
                    </CardFooter>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Desktop view - Grid layout */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {news.map((newsItem) => (
                <Card key={newsItem._id} className="overflow-hidden h-full flex flex-col">
                  <div className="relative h-48">
                    <Image
                      src={newsItem.image || "/placeholder.svg"}
                      alt={newsItem.title}
                      fill
                      className="object-cover"
                      crossOrigin="anonymous"
                      loading="lazy"
                    />
                    {newsItem.categories && newsItem.categories.length > 0 && (
                      <Badge className="absolute top-3 right-3">{newsItem.categories[0]}</Badge>
                    )}
                  </div>
                  <CardHeader className="flex-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Calendar className="h-4 w-4" />
                      <span>{newsItem.date}</span>
                    </div>
                    <CardTitle className="line-clamp-2">{newsItem.title}</CardTitle>
                    <CardDescription className="line-clamp-3 mt-2">{newsItem.description}</CardDescription>
                    {newsItem.locations && newsItem.locations.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {newsItem.locations.map((location, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {location}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardHeader>
                  <CardFooter>
                    <Button variant="outline" asChild className="w-full">
                      <Link href={`/news/${newsItem._id}`}>
                        Read More <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {/* Mobile view - Horizontal scrollable layout */}
            <div className="md:hidden relative">
              <div
                ref={scrollContainerRef}
                className="flex overflow-x-auto pb-6 gap-4 snap-x snap-mandatory scrollbar-hide"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {news.map((newsItem) => (
                  <div key={newsItem._id} className="min-w-[280px] flex-shrink-0 snap-start">
                    <Card className="h-full overflow-hidden flex flex-col">
                      <div className="relative h-40">
                        <Image
                          src={newsItem.image || "/placeholder.svg"}
                          alt={newsItem.title}
                          fill
                          className="object-cover"
                          crossOrigin="anonymous"
                          loading="lazy"
                        />
                        {newsItem.categories && newsItem.categories.length > 0 && (
                          <Badge className="absolute top-3 right-3">{newsItem.categories[0]}</Badge>
                        )}
                      </div>
                      <CardHeader className="flex-1 p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <Calendar className="h-4 w-4" />
                          <span>{newsItem.date}</span>
                        </div>
                        <CardTitle className="text-base line-clamp-2">{newsItem.title}</CardTitle>
                        <CardDescription className="text-sm line-clamp-2 mt-1">{newsItem.description}</CardDescription>
                      </CardHeader>
                      <CardFooter className="p-4 pt-0">
                        <Button variant="outline" asChild className="w-full" size="sm">
                          <Link href={`/news/${newsItem._id}`}>
                            Read More <ArrowRight className="ml-1 h-3 w-3" />
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                ))}
              </div>

              {/* Scroll buttons for mobile */}
              <div className="absolute top-1/2 left-0 transform -translate-y-1/2 z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-background/80 shadow-md"
                  onClick={scrollLeft}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Scroll left</span>
                </Button>
              </div>
              <div className="absolute top-1/2 right-0 transform -translate-y-1/2 z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-background/80 shadow-md"
                  onClick={scrollRight}
                >
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Scroll right</span>
                </Button>
              </div>
            </div>
          </>
        )}

        <div className="mt-12 text-center">
          <Button size="lg" variant="outline" asChild>
            <Link href="/news">
              View All News <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
