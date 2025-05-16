"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { Plus, Shield, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SecuritySectionService } from "@/services/content-service"
import { uploadMedia, deleteFile } from "@/utils/uploadImage"
import type { SecuritySection } from "@/types/security"
import Image from "next/image"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function SecuritySectionManager() {
  const [sections, setSections] = useState<SecuritySection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [currentSection, setCurrentSection] = useState<SecuritySection | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [iconName, setIconName] = useState<
    "Shield" | "Clipboard" | "HardHat" | "Link" | "BookOpen" | "Siren" | "TreePine"
  >("Shield")
  const [imageUrl, setImageUrl] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [sectionToDelete, setSectionToDelete] = useState<string | null>(null)

  useEffect(() => {
    fetchSections()
  }, [])

  const fetchSections = async () => {
    try {
      setLoading(true)
      const response = await SecuritySectionService.getSections()
      // Ensure data is an array
      const data = Array.isArray(response) ? response : response?.sections || []
      console.log(response)
      setSections(data)
      setLoading(false)
    } catch (err) {
      console.error("Error fetching security sections:", err)
      setError("Failed to load security sections. Please try again.")
      setLoading(false)
      // Set sections to empty array on error
      setSections([])
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0])
      setImageUrl(URL.createObjectURL(e.target.files[0]))
    }
  }

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setIconName("Shield")
    setImageUrl("")
    setImageFile(null)
    setCurrentSection(null)
  }

  const handleOpenDialog = (section?: SecuritySection) => {
    if (section) {
      setCurrentSection(section)
      setTitle(section.title)
      setDescription(section.description)
      setIconName(section.iconName)
      setImageUrl(section.imageUrl)
    } else {
      resetForm()
    }
    setOpenDialog(true)
  }

  const handleSaveSection = async () => {
    if (!title || !description) {
      toast.error("Title and description are required")
      return
    }

    try {
      let finalImageUrl = imageUrl

      // Upload new image if selected
      if (imageFile) {
        const uploadedImageUrl = await uploadMedia(imageFile)
        if (uploadedImageUrl) {
          // If updating and there was a previous image, delete it
          if (currentSection?.imageUrl && currentSection.imageUrl !== imageUrl) {
            try {
              // Extract filename from URL
              const filename = currentSection.imageUrl.split("/").pop()
              if (filename) {
                await deleteFile(filename)
              }
            } catch (err) {
              console.error("Error deleting old image:", err)
            }
          }
          finalImageUrl = uploadedImageUrl
        }
      }

      const sectionData: Omit<SecuritySection, "_id"> = {
        title,
        description,
        iconName,
        imageUrl: finalImageUrl,
      }

      if (currentSection?._id) {
        // Update existing section
        await SecuritySectionService.updateSection(currentSection._id, sectionData)
        setSections(
          sections.map((item) =>
            item._id === currentSection._id ? { ...sectionData, _id: currentSection._id } : item,
          ),
        )
        toast.success("Security section updated successfully")
      } else {
        // Create new section
        const createdSection = await SecuritySectionService.createSection(sectionData)
        setSections([...sections, createdSection])
        toast.success("Security section created successfully")
      }

      setOpenDialog(false)
      resetForm()
    } catch (err) {
      console.error("Error saving security section:", err)
      toast.error("Failed to save security section")
    }
  }

  const handleDeleteSection = async (id: string) => {
    try {
      await SecuritySectionService.deleteSection(id)
      setSections(sections.filter((item) => item._id !== id))
      toast.success("Security section deleted successfully")
    } catch (err) {
      console.error("Error deleting security section:", err)
      toast.error("Failed to delete security section")
    }
  }

  const handleDeleteConfirm = (id: string) => {
    setSectionToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (sectionToDelete) {
      await handleDeleteSection(sectionToDelete)
      setSectionToDelete(null)
    }
    setDeleteDialogOpen(false)
  }

  if (loading) return <div className="text-center py-8">Loading security sections...</div>
  if (error) return <div className="text-center text-red-500 py-8">{error}</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Security Sections</h2>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Section
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{currentSection ? "Edit Security Section" : "Add New Security Section"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-1">
                  Title
                </label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter section title"
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">
                  Description
                </label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter section description"
                  rows={4}
                />
              </div>
              <div>
                <label htmlFor="iconName" className="block text-sm font-medium mb-1">
                  Icon
                </label>
                <Select value={iconName} onValueChange={(value) => setIconName(value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an icon" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Shield">Shield</SelectItem>
                    <SelectItem value="Clipboard">Clipboard</SelectItem>
                    <SelectItem value="HardHat">Hard Hat</SelectItem>
                    <SelectItem value="Link">Link</SelectItem>
                    <SelectItem value="BookOpen">Book Open</SelectItem>
                    <SelectItem value="Siren">Siren</SelectItem>
                    <SelectItem value="TreePine">Tree Pine</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="image" className="block text-sm font-medium mb-1">
                  Image
                </label>
                <div className="flex items-center gap-4">
                  <Input id="image" type="file" accept="image/*" onChange={handleImageChange} className="flex-1" />
                  {(imageUrl || imageFile) && (
                    <div className="w-20 h-20 relative">
                      <Image
                        src={imageFile ? URL.createObjectURL(imageFile) : imageUrl}
                        alt="Preview"
                        width={80}
                        height={80}
                        className="w-full h-full object-cover rounded-md"
                        crossOrigin="anonymous"
                        onError={(e) => {
                          // Fallback to placeholder if image fails to load
                          e.currentTarget.src = "/placeholder.svg"
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setOpenDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveSection}>{currentSection ? "Update Section" : "Add Section"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {sections.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No security sections found. Click the "Add Section" button to create your first section.
        </div>
      ) : (
        <div className="space-y-4">
          {sections.map((section) => (
            <Card key={section._id} className="relative">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    {section.title}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDialog(section)}
                      className="h-8 w-8"
                      aria-label="Edit section"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteConfirm(section._id!)}
                      className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                      aria-label="Delete section"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-[1fr_200px] gap-4">
                  <div>
                    <p className="text-muted-foreground mb-4">{section.description}</p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <span className="font-medium mr-2">Icon:</span> {section.iconName}
                    </div>
                  </div>
                  {section.imageUrl && (
                    <div className="w-full h-32 md:h-full">
                      <Image
                        src={section.imageUrl.includes("localhost") ? section.imageUrl : `/placeholder.svg`}
                        alt={section.title}
                        width={200}
                        height={128}
                        className="w-full h-full object-cover rounded-md"
                        crossOrigin="anonymous"
                        loading="lazy"
                        onError={(e) => {
                          // Fallback to placeholder if image fails to load
                          e.currentTarget.src = "/placeholder.svg"
                        }}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this section?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the security section.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
