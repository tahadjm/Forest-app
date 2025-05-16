"use client"

import { useEffect, useState } from "react"
import { HeroSection } from "@/components/ui/hero-section"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Filter, Search, Tag, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { NewsService } from "@/services/index"
import Image from "next/image"
import Link from "next/link"
import type { NewsSection as NewsSectionType } from "@/components/news/news-section"

export default function NewsPage() {
  const [news, setNews] = useState<NewsSectionType[]>([])
  const [filteredNews, setFilteredNews] = useState<NewsSectionType[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedLocation, setSelectedLocation] = useState<string>("all")

  // Unique categories and locations for filters
  const [categories, setCategories] = useState<string[]>([])
  const [locations, setLocations] = useState<string[]>([])

  // Fetch news data
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await NewsService.getNews()

        if (!response || !Array.isArray(response)) {
          throw new Error("Invalid response format")
        }

        // Map the response to the NewsSection type
        const formattedNews: NewsSectionType[] = response.map((item: any) => ({
          _id: item._id || item.id || undefined,
          title: item.title || "",
          description: item.description || "",
          date: item.date || new Date(item.createdAt || Date.now()).toLocaleDateString(),
          image: item.image || "/placeholder.svg?height=300&width=600",
          locations: Array.isArray(item.locations) ? item.locations : [],
          categories: Array.isArray(item.categories) ? item.categories : item.category ? [item.category] : [],
          createdAt: item.createdAt ? new Date(item.createdAt) : undefined,
          updatedAt: item.updatedAt ? new Date(item.updatedAt) : undefined,
        }))

        setNews(formattedNews)
        setFilteredNews(formattedNews)

        // Extract unique categories and locations
        const allCategories = formattedNews.flatMap((item) => item.categories || [])
        const allLocations = formattedNews.flatMap((item) => item.locations || [])

        setCategories([...new Set(allCategories)].filter(Boolean))
        setLocations([...new Set(allLocations)].filter(Boolean))
      } catch (error) {
        console.error("Error fetching news:", error)
        setError(error instanceof Error ? error.message : "Failed to fetch news data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchNews()
  }, [])

  // Filter news based on search query and selected filters
  useEffect(() => {
    let filtered = [...news]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (item) => item.title.toLowerCase().includes(query) || item.description.toLowerCase().includes(query),
      )
    }

    // Apply category filter
    if (selectedCategory && selectedCategory !== "all") {
      filtered = filtered.filter((item) => item.categories?.includes(selectedCategory))
    }

    // Apply location filter
    if (selectedLocation && selectedLocation !== "all") {
      filtered = filtered.filter((item) => item.locations?.includes(selectedLocation))
    }

    setFilteredNews(filtered)
  }, [searchQuery, selectedCategory, selectedLocation, news])

  return (
    <div className="min-h-screen pb-16">
      <HeroSection
        title="News & Updates"
        description="Stay informed about our latest attractions, events, and special offers"
        backgroundType="color"
        height="small"
      />

      <div className="container mx-auto px-4 mt-8">
        {/* Filters */}
        <div className="mb-8 bg-card rounded-lg border p-4 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search news..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <div className="flex items-center">
                    <Tag className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Category" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {locations.length > 0 && (
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger className="w-[180px]">
                    <div className="flex items-center">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Location" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </div>

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="overflow-hidden h-full flex flex-col">
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
            ))}
          </div>
        ) : filteredNews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNews.map((newsItem) => (
              <Card key={newsItem._id} className="overflow-hidden h-full flex flex-col">
                <div className="relative h-48">
                  <Image
                    src={newsItem.image || "/placeholder.svg?height=300&width=600"}
                    alt={newsItem.title}
                    fill
                    className="object-cover"
                    crossOrigin="anonymous"
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
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/news/${newsItem._id}`}>Read More</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold mb-2">No news articles found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search criteria or check back later for new updates.
            </p>
            {(searchQuery || selectedCategory !== "all" || selectedLocation !== "all") && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("")
                  setSelectedCategory("all")
                  setSelectedLocation("all")
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
