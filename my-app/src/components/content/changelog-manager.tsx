"use client"

import { useState, useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileUploader } from "react-drag-drop-files"
import { uploadMedia } from "@/utils/uploadImage"
import { ChangelogService } from "@/services/content-service"
import { Loader2, Plus, X, Edit, Trash2, ImageIcon } from "lucide-react"
import toast from "react-hot-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { TimelineDemo } from "../TimeLine/TimelineDemo"

// Define the schema for the changelog form
const changelogSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.object({
    description: z.string().min(1, "Description is required"),
    updates: z.array(z.string().min(1, "Update item cannot be empty")),
    images: z.array(
      z.object({
        src: z.string().url("Must be a valid URL"),
      }),
    ),
  }),
})

type ChangelogFormValues = z.infer<typeof changelogSchema>

export function ChangelogManager() {
  const [changelogs, setChangelogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [currentChangelogId, setCurrentChangelogId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [changelogToDelete, setChangelogToDelete] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("list")
  const [newUpdate, setNewUpdate] = useState("")

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ChangelogFormValues>({
    resolver: zodResolver(changelogSchema),
    defaultValues: {
      title: "",
      content: {
        description: "",
        updates: [],
        images: [],
      },
    },
  })

  const {
    fields: updateFields,
    append: appendUpdate,
    remove: removeUpdate,
  } = useFieldArray({
    control,
    name: "content.updates",
  })

  const {
    fields: imageFields,
    append: appendImage,
    remove: removeImage,
  } = useFieldArray({
    control,
    name: "content.images",
  })

  // Fetch changelogs on component mount
  useEffect(() => {
    fetchChangelogs()
  }, [])

  const fetchChangelogs = async () => {
    try {
      setLoading(true)
      const data = await ChangelogService.getChangelogs()
      setChangelogs(data)
    } catch (error) {
      console.error("Error fetching changelogs:", error)
      toast.error("Failed to load changelogs")
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: ChangelogFormValues) => {
    try {
      setIsSubmitting(true)

      if (editMode && currentChangelogId) {
        await ChangelogService.updateChangelog(currentChangelogId, data)
        toast.success("Changelog updated successfully")
      } else {
        await ChangelogService.addChangelog(data as any)
        toast.success("Changelog added successfully")
      }

      // Reset form and fetch updated changelogs
      reset()
      setEditMode(false)
      setCurrentChangelogId(null)
      setActiveTab("list")
      fetchChangelogs()
    } catch (error) {
      console.error("Error saving changelog:", error)
      toast.error("Failed to save changelog")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (changelog: any) => {
    setEditMode(true)
    setCurrentChangelogId(changelog._id)
    reset({
      title: changelog.title,
      content: {
        description: changelog.content.description,
        updates: changelog.content.updates || [],
        images: changelog.content.images || [],
      },
    })
    setActiveTab("form")
  }

  const handleDelete = (id: string) => {
    setChangelogToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!changelogToDelete) return

    try {
      await ChangelogService.deleteChangelog(changelogToDelete)
      toast.success("Changelog deleted successfully")
      fetchChangelogs()
    } catch (error) {
      console.error("Error deleting changelog:", error)
      toast.error("Failed to delete changelog")
    } finally {
      setDeleteDialogOpen(false)
      setChangelogToDelete(null)
    }
  }

  const handleAddUpdate = () => {
    if (!newUpdate.trim()) {
      toast.error("Update cannot be empty")
      return
    }

    appendUpdate(newUpdate.trim())
    setNewUpdate("")
  }

  const handleImageUpload = async (file: File) => {
    setIsUploadingImage(true)
    try {
      const imageUrl = await uploadMedia(file)
      if (imageUrl) {
        appendImage({ src: imageUrl })
        toast.success("Image uploaded successfully")
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      toast.error("Failed to upload image")
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleCancel = () => {
    reset()
    setEditMode(false)
    setCurrentChangelogId(null)
    setActiveTab("list")
  }

  return (
    <div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="list">Changelogs</TabsTrigger>
          <TabsTrigger value="form">{editMode ? "Edit Changelog" : "Add Changelog"}</TabsTrigger>
          <TabsTrigger value="preview">Preview Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Changelog Entries</CardTitle>
              <CardDescription>Manage your changelog entries</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="border rounded-lg p-4">
                      <Skeleton className="h-6 w-1/3 mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  ))}
                </div>
              ) : changelogs.length > 0 ? (
                <div className="space-y-4">
                  {changelogs.map((changelog) => (
                    <Card key={changelog._id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg">{changelog.title}</CardTitle>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(changelog)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(changelog._id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-2">{changelog.content.description}</p>

                        {changelog.content.updates && changelog.content.updates.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {changelog.content.updates.map((update: string, idx: number) => (
                              <div key={idx} className="flex items-start gap-2 text-sm">
                                <span className="text-green-500">✓</span>
                                <span>{update}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {changelog.content.images && changelog.content.images.length > 0 && (
                          <div className="mt-4 grid grid-cols-3 gap-2">
                            {changelog.content.images.map((image: any, idx: number) => (
                              <div key={idx} className="relative h-20 rounded overflow-hidden">
                                <img
                                  src={image.src || "/placeholder.svg"}
                                  alt={`Image ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                  crossOrigin="anonymous"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No changelog entries found. Add your first changelog entry.
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={() => setActiveTab("form")}>
                <Plus className="h-4 w-4 mr-2" /> Add Changelog
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="form">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Card>
              <CardHeader>
                <CardTitle>{editMode ? "Edit Changelog" : "Add Changelog"}</CardTitle>
                <CardDescription>
                  {editMode
                    ? "Update the details of your changelog entry"
                    : "Create a new changelog entry to document updates and changes"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" placeholder="e.g., New Features - June 2023" {...register("title")} />
                  {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide a brief overview of this changelog"
                    rows={3}
                    {...register("content.description")}
                  />
                  {errors.content?.description && (
                    <p className="text-red-500 text-sm">{errors.content.description.message}</p>
                  )}
                </div>

                {/* Updates */}
                <div className="space-y-2">
                  <Label>Updates</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add an update item"
                      value={newUpdate}
                      onChange={(e) => setNewUpdate(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="button" onClick={handleAddUpdate}>
                      <Plus className="h-4 w-4 mr-2" /> Add
                    </Button>
                  </div>

                  <div className="mt-4 space-y-2">
                    {updateFields.map((field, index) => (
                      <div key={field.id} className="flex items-center gap-2 bg-muted/50 p-2 rounded">
                        <span className="flex-1 text-sm">{watch(`content.updates.${index}`)}</span>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeUpdate(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}

                    {updateFields.length === 0 && (
                      <p className="text-sm text-muted-foreground">No updates added yet.</p>
                    )}
                  </div>
                </div>

                {/* Images */}
                <div className="space-y-2">
                  <Label>Images</Label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 transition-all hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <FileUploader handleChange={handleImageUpload} name="image" types={["JPG", "PNG", "GIF"]}>
                      <div className="flex flex-col items-center justify-center py-4 text-center">
                        <div className="mb-3 rounded-full bg-primary/10 p-3">
                          <ImageIcon className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold">Add Images</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          or <span className="text-primary font-medium">browse files</span>
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">Supported formats: JPG, PNG, GIF</p>
                      </div>
                    </FileUploader>
                  </div>

                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                    {imageFields.map((field, index) => (
                      <div key={field.id} className="relative group">
                        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
                          <img
                            src={watch(`content.images.${index || "/placeholder.svg"}.src`)}
                            alt={`Image ${index + 1}`}
                            className="h-32 w-full object-cover transition-transform group-hover:scale-105"
                            crossOrigin="anonymous"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}

                    {imageFields.length === 0 && (
                      <p className="text-sm text-muted-foreground col-span-3">No images added yet.</p>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || isUploadingImage}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {editMode ? "Updating..." : "Saving..."}
                    </>
                  ) : (
                    <>{editMode ? "Update Changelog" : "Save Changelog"}</>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Timeline Preview</CardTitle>
              <CardDescription>Preview how your changelog will appear in the timeline</CardDescription>
            </CardHeader>
            <CardContent>
              <TimelineDemo />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to delete this changelog?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the changelog entry.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
