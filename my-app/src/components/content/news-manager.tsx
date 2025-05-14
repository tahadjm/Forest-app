"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { Plus, Pencil, Trash2, Calendar, Tag, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { NewsService } from "@/services/content-service"
import { uploadMedia, deleteFile } from "@/utils/uploadImage"
import type { NewsSection } from "@/types/news"
import Image from "next/image"

export function NewsManager() {
  const [news, setNews] = useState<NewsSection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [currentNews, setCurrentNews] = useState<NewsSection | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState("")
  const [image, setImage] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [locations, setLocations] = useState<string[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [newLocation, setNewLocation] = useState("")
  const [newCategory, setNewCategory] = useState("")

  useEffect(() => {
    fetchNews()
  }, [])

  const fetchNews = async () => {
    try {
      setLoading(true)
      const data = await NewsService.getNews()
      setNews(Array.isArray(data) ? data : [data])
      setLoading(false)
    } catch (err) {
      console.error("Error fetching news:", err)
      setError("Failed to load news. Please try again.")
      setLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0])
      setImage(URL.createObjectURL(e.target.files[0]))
    }
  }

  const handleAddLocation = () => {
    if (newLocation && !locations.includes(newLocation)) {
      setLocations([...locations, newLocation])
      setNewLocation("")
    }
  }

  const handleRemoveLocation = (location: string) => {
    setLocations(locations.filter((loc) => loc !== location))
  }

  const handleAddCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory])
      setNewCategory("")
    }
  }

  const handleRemoveCategory = (category: string) => {
    setCategories(categories.filter((cat) => cat !== category))
  }

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setDate("")
    setImage("")
    setImageFile(null)
    setLocations([])
    setCategories([])
    setCurrentNews(null)
  }

  const handleOpenDialog = (newsItem?: NewsSection) => {
    if (newsItem) {
      setCurrentNews(newsItem)
      setTitle(newsItem.title)
      setDescription(newsItem.description)
      setDate(newsItem.date)
      setImage(newsItem.image)
      setLocations(newsItem.locations || [])
      setCategories(newsItem.categories || [])
    } else {
      resetForm()
    }
    setOpenDialog(true)
  }

  const handleSaveNews = async () => {
    if (!title || !description || !date) {
      toast.error("Title, description, and date are required")
      return
    }

    try {
      let imageUrl = image

      // Upload new image if selected
      if (imageFile) {
        const uploadedImageUrl = await uploadMedia(imageFile)
        if (uploadedImageUrl) {
          // If updating and there was a previous image, delete it
          if (currentNews?.image && currentNews.image !== imageUrl) {
            try {
              // Extract filename from URL
              const filename = currentNews.image.split("/").pop()
              if (filename) {
                await deleteFile(filename)
              }
            } catch (err) {
              console.error("Error deleting old image:", err)
            }
          }
          imageUrl = uploadedImageUrl
        }
      }

      const newsData: NewsSection = {
        title,
        description,
        date,
        image: imageUrl,
        locations,
        categories,
      }

      if (currentNews?._id) {
        // Update existing news
        await NewsService.updateNews(currentNews._id, newsData)
        setNews(news.map((item) => (item._id === currentNews._id ? { ...newsData, _id: currentNews._id } : item)))
        toast.success("News updated successfully")
      } else {
        // Create new news
        const createdNews = await NewsService.createNews(newsData)
        setNews([...news, createdNews])
        toast.success("News created successfully")
      }

      setOpenDialog(false)
      resetForm()
    } catch (err) {
      console.error("Error saving news:", err)
      toast.error("Failed to save news")
    }
  }

  const handleDeleteNews = async (id: string) => {
    try {
      await NewsService.deleteNews(id)
      setNews(news.filter((item) => item._id !== id))
      toast.success("News deleted successfully")
    } catch (err) {
      console.error("Error deleting news:", err)
      toast.error("Failed to delete news")
    }
  }

  if (loading) return <div className="text-center py-8">Loading news content...</div>
  if (error) return <div className="text-center text-red-500 py-8">{error}</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">News Articles</h2>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Add News
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{currentNews ? "Edit News" : "Add New News"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium mb-1">
                    Title
                  </label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter news title"
                  />
                </div>
                <div>
                  <label htmlFor="date" className="block text-sm font-medium mb-1">
                    Date
                  </label>
                  <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">
                  Description
                </label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter news description"
                  rows={4}
                />
              </div>

              <div>
                <label htmlFor="image" className="block text-sm font-medium mb-1">
                  Image
                </label>
                <div className="flex items-center gap-4">
                  <Input id="image" type="file" accept="image/*" onChange={handleImageChange} className="flex-1" />
                  {(image || imageFile) && (
                    <div className="w-20 h-20 relative">
                      <Image
                        src={imageFile ? URL.createObjectURL(imageFile) : image}
                        alt="Preview"
                        width={80}
                        height={80}
                        className="w-full h-full object-cover rounded-md"
                        crossOrigin="anonymous"
                        loading="lazy"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Locations</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {locations.map((loc, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {loc}
                      <button
                        onClick={() => handleRemoveLocation(loc)}
                        className="ml-1 text-xs rounded-full hover:bg-muted p-1"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="Add location"
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" onClick={handleAddLocation}>
                    Add
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Categories</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {categories.map((cat, index) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-1">
                      {cat}
                      <button
                        onClick={() => handleRemoveCategory(cat)}
                        className="ml-1 text-xs rounded-full hover:bg-muted p-1"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Add category"
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" onClick={handleAddCategory}>
                    Add
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setOpenDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveNews}>{currentNews ? "Update News" : "Add News"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {news.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No news articles found. Click the "Add News" button to create your first article.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {news.map((item) => (
            <Card key={item._id} className="overflow-hidden">
              <div className="h-48 overflow-hidden">
                <Image
                  src={item.image || "/placeholder.svg?height=200&width=400"}
                  alt={item.title}
                  width={400}
                  height={200}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  crossOrigin="anonymous"
                />
              </div>
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Calendar className="h-4 w-4" />
                  <span>{item.date}</span>
                </div>
                <p className="line-clamp-3">{item.description}</p>
                <div className="mt-4 space-y-2">
                  {item.locations && item.locations.length > 0 && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div className="flex flex-wrap gap-1">
                        {item.locations.map((loc, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {loc}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {item.categories && item.categories.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      <div className="flex flex-wrap gap-1">
                        {item.categories.map((cat, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {cat}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2 border-t p-4">
                <Button variant="outline" size="sm" onClick={() => handleOpenDialog(item)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-500"
                  onClick={() => handleDeleteNews(item._id || "")}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
