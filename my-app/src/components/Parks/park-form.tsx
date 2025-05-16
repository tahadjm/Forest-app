"use client"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, Controller, useFieldArray } from "react-hook-form"
import { z } from "zod"
import { ParkService } from "@/services/park-service"
import LoadingButton from "../LoadingButton/LoadingButton"
import type { AxiosError } from "axios"
import { Loader2, X, ImageIcon, Play, Upload, LinkIcon } from "lucide-react"
import { FileUploader } from "react-drag-drop-files"
import { uploadMedia, deleteFile } from "@/utils/uploadImage"
import { EditButton } from "@/components/ui/edit-button"

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const

const workingHoursSchema = z.object({
  from: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)")
    .optional(),
  to: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)")
    .optional(),
  closed: z.boolean().default(false),
})

const ruleSchema = z.object({
  ruleNumber: z.number().min(1, "Rule number must be at least 1").optional(),
  description: z.string().min(1, "Rule description is required"),
})

const parkSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().min(1, "Name is required"),
    // Require a fully qualified URL.
    imageUrl: z
      .string()
      .refine((url) => url.match(/^https?:\/\/.+/), { message: "Image URL is required and must be a valid URL" }),
    headerMedia: z.string().optional(), // Add headerMedia field to match the Park type
    location: z.string().min(1, "Location is required"),
    description: z.string().min(10, "Description is required"),
    maxBookingDays: z.number().min(1).max(365).default(30),
    workingHours: z
      .record(z.enum(daysOfWeek), workingHoursSchema)
      .default(Object.fromEntries(daysOfWeek.map((day) => [day, { from: "09:00", to: "18:00", closed: false }]))),
    galleryImages: z.array(z.string()).default([]),
    facilities: z.array(z.string()).default([]),
    rules: z.array(ruleSchema).default([]),
  })
  .transform((data) => ({
    ...data,
    workingHours: Object.fromEntries(
      Object.entries(data.workingHours).map(([day, schedule]) =>
        schedule.closed ? [day, { closed: true }] : [day, schedule],
      ),
    ),
  }))

type ParkFormValues = z.infer<typeof parkSchema>

interface ParkFormProps {
  parkId?: string
}

// Accepted file types
const IMAGE_FILE_TYPES = ["JPG", "PNG", "GIF", "JPEG"]
const VIDEO_FILE_TYPES = ["MP4", "WEBM", "OGG", "MOV"]

export function ParkForm({ parkId }: ParkFormProps) {
  const isEditMode = !!parkId

  const initialEditableState: Record<string, boolean> = {
    name: !isEditMode, // Only editable in create mode by default
    location: !isEditMode,
    description: !isEditMode,
    maxBookingDays: !isEditMode,
    imageUrl: true, // Always editable
    headerMedia: true, // Always editable
    galleryImages: true, // Always editable
    facilities: true, // Always editable
    rules: true, // Always editable
  }

  daysOfWeek.forEach((day) => {
    initialEditableState[`workingHours_${day}_from`] = !isEditMode
    initialEditableState[`workingHours_${day}_to`] = !isEditMode
  })

  const [editableFields, setEditableFields] = useState(initialEditableState)
  const [isLoading, setIsLoading] = useState(isEditMode)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isUploadingHeaderVideo, setIsUploadingHeaderVideo] = useState(false)
  const [newFacility, setNewFacility] = useState("")
  const [headerVideoInputType, setHeaderVideoInputType] = useState<"upload" | "url">("upload")

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ParkFormValues>({
    resolver: zodResolver(parkSchema),
    defaultValues: {
      name: "",
      imageUrl: "",
      headerMedia: "",
      location: "",
      description: "",
      maxBookingDays: 30,
      workingHours: Object.fromEntries(daysOfWeek.map((day) => [day, { from: "09:00", to: "18:00", closed: false }])),
      galleryImages: [],
      facilities: [],
      rules: [],
    },
  })

  const {
    fields: ruleFields,
    append: appendRule,
    remove: removeRule,
  } = useFieldArray({
    control,
    name: "rules",
  })

  // Watch values for conditional rendering
  const watchHeaderVideo = watch("headerMedia")

  // Handle file upload for main image
  const handleFileChange = async (file: File) => {
    setIsUploadingImage(true)
    try {
      const imageUrl = await uploadMedia(file)
      if (imageUrl) {
        // Set value and trigger validation immediately.
        setValue("imageUrl", imageUrl, { shouldValidate: true })
        toast.success("Image uploaded successfully")

        // Make sure all fields are editable after uploading a new image in edit mode
        if (isEditMode) {
          setEditableFields((prev) => ({
            ...prev,
            name: true,
            location: true,
            description: true,
            maxBookingDays: true,
          }))
        }
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      toast.error("Failed to upload image. Please try again.")
    } finally {
      setIsUploadingImage(false)
    }
  }

  // Handle header video upload
  const handleHeaderVideoUpload = async (file: File) => {
    try {
      setIsUploadingHeaderVideo(true)
      const videoUrl = await uploadMedia(file)
      if (videoUrl) {
        setValue("headerMedia", videoUrl, { shouldValidate: true }) // Set both headerMedia and headerMedia
        toast.success("Header video uploaded successfully")

        // Make all fields editable after video upload
        if (isEditMode) {
          const updatedEditableFields = { ...editableFields }
          Object.keys(updatedEditableFields).forEach((key) => {
            updatedEditableFields[key] = true
          })
          setEditableFields(updatedEditableFields)
        }
      }
    } catch (error) {
      console.error("Error uploading header video:", error)
      toast.error("Failed to upload header video")
    } finally {
      setIsUploadingHeaderVideo(false)
    }
  }

  // Handle file upload for gallery images
  const handleGalleryImageUpload = async (file: File) => {
    setIsUploadingImage(true)
    try {
      const imageUrl = await uploadMedia(file)
      if (imageUrl) {
        const currentGallery = watch("galleryImages") || []
        setValue("galleryImages", [...currentGallery, imageUrl], { shouldValidate: true })
        toast.success("Gallery image uploaded successfully")
      }
    } catch (error) {
      console.error("Error uploading gallery image:", error)
      toast.error("Failed to upload gallery image. Please try again.")
    } finally {
      setIsUploadingImage(false)
    }
  }

  // Remove gallery image
  const removeGalleryImage = (index: number) => {
    const currentGallery = [...watch("galleryImages")]
    const imageUrl = currentGallery[index]

    // Try to delete the file from storage if possible
    if (imageUrl) {
      const filename = imageUrl.split("/").pop()
      if (filename) {
        deleteFile(filename).catch((err) => {
          console.error("Error deleting gallery image file:", err)
        })
      }
    }

    currentGallery.splice(index, 1)
    setValue("galleryImages", currentGallery, { shouldValidate: true })
    toast.success("Gallery image removed")
  }

  // Remove header video
  const removeHeaderVideo = () => {
    const videoUrl = watch("headerMedia")

    // Try to delete the file from storage if possible
    if (videoUrl) {
      const filename = videoUrl.split("/").pop()
      if (filename) {
        deleteFile(filename).catch((err) => {
          console.error("Error deleting header video file:", err)
        })
      }
    }

    setValue("headerMedia", "", { shouldValidate: true }) // Clear headerMedia as well
    toast.info("Header video removed")
  }

  // Add facility
  const addFacility = () => {
    if (!newFacility.trim()) {
      toast.error("Facility name cannot be empty")
      return
    }

    const currentFacilities = watch("facilities") || []
    if (currentFacilities.includes(newFacility.trim())) {
      toast.error("This facility already exists")
      return
    }

    setValue("facilities", [...currentFacilities, newFacility.trim()], { shouldValidate: true })
    setNewFacility("")
    toast.success("Facility added")
  }

  // Remove facility
  const removeFacility = (index: number) => {
    const currentFacilities = [...watch("facilities")]
    currentFacilities.splice(index, 1)
    setValue("facilities", currentFacilities, { shouldValidate: true })
    toast.success("Facility removed")
  }

  // When in edit mode, load the park data.
  useEffect(() => {
    async function loadParkData() {
      if (!parkId) return

      try {
        setIsLoading(true)
        const parkData = await ParkService.getParkById(parkId)
        const defaultWorkingHours = Object.fromEntries(
          daysOfWeek.map((day) => [day, { from: "09:00", to: "18:00", closed: false }]),
        )
        const mergedWorkingHours = { ...defaultWorkingHours, ...parkData.data.workingHours }

        // Get the header video from either headerMedia or headerMedia field
        const headerVideoUrl = parkData.data.headerMedia || parkData.data.headerMedia || ""

        // Set header video input type based on URL
        if (headerVideoUrl) {
          setHeaderVideoInputType(!headerVideoUrl.includes("http") ? "upload" : "url")
        }

        reset({
          id: parkData.data._id,
          name: parkData.data.name,
          imageUrl: parkData.data.imageUrl,
          headerMedia: headerVideoUrl, // Set both fields to the same value
          location: parkData.data.location,
          description: parkData.data.description ?? "",
          maxBookingDays: parkData.data.maxBookingDays,
          workingHours: mergedWorkingHours,
          galleryImages: parkData.data.galleryImages || [],
          facilities: parkData.data.facilities || [],
          rules: parkData.data.rules || [],
        })
      } catch (error) {
        console.error("Error fetching park:", error)
        setLoadError("Failed to load park data. Please try again.")
        toast.error("Failed to load park data")
      } finally {
        setIsLoading(false)
      }
    }
    loadParkData()
  }, [parkId, reset])

  // Warn user when deleting image in update mode.
  const handleImageRemove = () => {
    const imageUrl = watch("imageUrl")
    if (imageUrl) {
      const filename = imageUrl.split("/").pop()
      if (filename) {
        deleteFile(filename)
      }
    }
    setValue("imageUrl", "", { shouldValidate: true })

    if (isEditMode) {
      toast.info("Please upload a new image before updating")
    }
  }

  const onSubmit = async (data: ParkFormValues) => {
    console.log("Submitting data:", data)
    // Prevent submission if image is uploading.
    if (isUploadingImage || isUploadingHeaderVideo) {
      toast.error("Please wait until the media upload is complete.")
      return
    }

    // Ensure imageUrl is not empty.
    if (!data.imageUrl) {
      toast.error("Please upload an image before saving")
      setError("imageUrl", { type: "manual", message: "Image is required" })
      return
    }

    try {
      if (isEditMode && parkId) {
        const { id, ...dataWithoutId } = data

        // Ensure headerMedia is set from headerMedia if needed
        if (data.headerMedia && !data.headerMedia) {
          dataWithoutId.headerMedia = data.headerMedia
        }

        await ParkService.updatePark(parkId, dataWithoutId)
        toast.success("Park updated successfully!")

        // Reset editable fields after successful update
        const resetEditableState = { ...initialEditableState }
        setEditableFields(resetEditableState)

        // Refresh the page after a short delay to show the updated data
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        // For new parks, ensure headerMedia is set from headerMedia
        if (data.headerMedia) {
          data.headerMedia = data.headerMedia
        }

        await ParkService.createPark(data)
        toast.success("Park created successfully!")

        // Redirect to parks list after successful creation
        setTimeout(() => {
          window.location.href = "/dashboard/parks"
        }, 1500)
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? "updating" : "creating"} park:`, error)
      const axiosError = error as AxiosError<any>
      if (axiosError.response) {
        const { data, status } = axiosError.response
        if (data.errors) {
          Object.entries(data.errors).forEach(([field, message]) => {
            try {
              setError(field as any, { type: "server", message: message as string })
            } catch (e) {
              toast.error(`${field}: ${message}`)
            }
          })
          toast.error("Please correct the errors in the form")
        } else if (data.message) {
          toast.error(data.message)
        } else if (status === 401) {
          toast.error("You need to be logged in to perform this action")
        } else if (status === 403) {
          toast.error("You don't have permission to perform this action")
        } else {
          toast.error(`Error: ${status}`)
        }
      } else if (axiosError.request) {
        toast.error("No response received from server. Please check your connection.")
      } else {
        toast.error(axiosError.message || "An unexpected error occurred")
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading park data...</span>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 rounded-md text-red-800">
        <h3 className="font-semibold mb-2">Error</h3>
        <p>{loadError}</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Tabs defaultValue="general">
        <TabsList className="mb-4">
          <TabsTrigger value="general">General Information</TabsTrigger>
          <TabsTrigger value="header">Header Video</TabsTrigger>
          <TabsTrigger value="hours">Working Hours</TabsTrigger>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
          <TabsTrigger value="facilities">Facilities</TabsTrigger>
          <TabsTrigger value="rules">Rules</TabsTrigger>
        </TabsList>

        {/* General Info Tab */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>{isEditMode ? "Edit Park" : "Create Park"}</CardTitle>
              <CardDescription>Basic information about the park</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Park Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Park Name</Label>
                <div className="relative">
                  <Input {...register("name")} placeholder="Enter park name" disabled={!editableFields.name} />
                  {isEditMode && (
                    <EditButton
                      size="sm"
                      variant="subtle"
                      tooltipText="Edit name"
                      onEdit={() => setEditableFields((prev) => ({ ...prev, name: !prev.name }))}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    />
                  )}
                </div>
                {errors.name && <p className="text-red-500">{errors.name.message}</p>}
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <div className="relative">
                  <Input
                    {...register("location")}
                    placeholder="Enter park location"
                    disabled={!editableFields.location}
                  />
                  {isEditMode && (
                    <EditButton
                      size="sm"
                      variant="subtle"
                      tooltipText="Edit location"
                      onEdit={() => setEditableFields((prev) => ({ ...prev, location: !prev.location }))}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    />
                  )}
                </div>
                {errors.location && <p className="text-red-500">{errors.location.message}</p>}
              </div>

              {/* File Upload for Park Image */}
              <div className="space-y-2">
                <Label htmlFor="imageUpload">Park Thumbnail Image</Label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 transition-all hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <FileUploader handleChange={handleFileChange} name="file" types={["JPG", "PNG", "GIF"]}>
                    <div className="flex flex-col items-center justify-center py-4 text-center">
                      <div className="mb-3 rounded-full bg-primary/10 p-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-6 w-6 text-primary"
                        >
                          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7" />
                          <line x1="16" x2="22" y1="5" y2="5" />
                          <line x1="19" x2="19" y1="2" y2="8" />
                          <circle cx="9" cy="9" r="2" />
                          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold">Drag & Drop your image here</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        or <span className="text-primary font-medium">browse files</span>
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">Supported formats: JPG, PNG, GIF</p>
                    </div>
                  </FileUploader>
                </div>
                {errors.imageUrl && <p className="text-red-500 text-sm">{errors.imageUrl.message}</p>}

                {/* Preview uploaded image if available */}
                {watch("imageUrl") && (
                  <div className="mt-4 relative group">
                    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
                      <img
                        src={watch("imageUrl") || "/placeholder.svg"}
                        alt="Uploaded Park"
                        className="h-48 w-full object-cover transition-transform group-hover:scale-105"
                        crossOrigin="anonymous"
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm text-muted-foreground truncate max-w-[80%]">
                        {watch("imageUrl").split("/").pop() || "Uploaded image"}
                      </span>
                      <Button type="button" variant="outline" size="sm" onClick={handleImageRemove} className="text-xs">
                        Remove
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <div className="relative">
                  <Textarea
                    {...register("description")}
                    placeholder="Enter park description"
                    rows={4}
                    disabled={!editableFields.description}
                  />
                  {isEditMode && (
                    <EditButton
                      size="sm"
                      variant="subtle"
                      tooltipText="Edit description"
                      onEdit={() => setEditableFields((prev) => ({ ...prev, description: !prev.description }))}
                      className="absolute right-2 top-2"
                    />
                  )}
                </div>
                {errors.description && <p className="text-red-500">{errors.description.message}</p>}
              </div>

              {/* Max Booking Days */}
              <div className="space-y-2">
                <Label htmlFor="maxBookingDays">Max Booking Days</Label>
                <div className="relative">
                  <Input
                    type="number"
                    {...register("maxBookingDays", { valueAsNumber: true })}
                    min="1"
                    max="365"
                    disabled={!editableFields.maxBookingDays}
                  />
                  {isEditMode && (
                    <EditButton
                      size="sm"
                      variant="subtle"
                      tooltipText="Edit max booking days"
                      onEdit={() => setEditableFields((prev) => ({ ...prev, maxBookingDays: !prev.maxBookingDays }))}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    />
                  )}
                </div>
                {errors.maxBookingDays && <p className="text-red-500">{errors.maxBookingDays.message}</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Header Video Tab */}
        <TabsContent value="header">
          <Card>
            <CardHeader>
              <CardTitle>Header Video</CardTitle>
              <CardDescription>Upload a header video for the park</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs
                defaultValue="upload"
                value={headerVideoInputType}
                onValueChange={(value) => setHeaderVideoInputType(value as "upload" | "url")}
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload" className="flex items-center justify-center gap-2">
                    <Upload className="h-4 w-4" />
                    Upload Video
                  </TabsTrigger>
                  <TabsTrigger value="url" className="flex items-center justify-center gap-2">
                    <LinkIcon className="h-4 w-4" />
                    Video URL
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="pt-4">
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 transition-all hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <FileUploader
                      handleChange={handleHeaderVideoUpload}
                      name="headerMedia"
                      types={VIDEO_FILE_TYPES}
                      disabled={isUploadingHeaderVideo}
                    >
                      <div className="flex flex-col items-center justify-center py-4 text-center">
                        <div className="mb-3 rounded-full bg-primary/10 p-3">
                          {isUploadingHeaderVideo ? (
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          ) : (
                            <Play className="h-6 w-6 text-primary" />
                          )}
                        </div>
                        <h3 className="text-lg font-semibold">Drag & Drop your video here</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          or <span className="text-primary font-medium">browse files</span>
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">Supported formats: MP4, WEBM, OGG, MOV</p>
                      </div>
                    </FileUploader>
                  </div>
                </TabsContent>

                <TabsContent value="url" className="pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="headerVideoUrl">Video URL</Label>
                    <div className="relative">
                      <Input
                        id="headerVideoUrl"
                        placeholder="Enter video URL (e.g., https://example.com/video.mp4)"
                        value={watchHeaderVideo}
                        onChange={(e) => setValue("headerMedia", e.target.value, { shouldValidate: true })}
                        disabled={isEditMode && !editableFields.headerMedia}
                      />
                      {isEditMode && (
                        <EditButton
                          size="sm"
                          variant="subtle"
                          tooltipText="Edit header video URL"
                          onEdit={() => setEditableFields((prev) => ({ ...prev, headerMedia: !prev.headerMedia }))}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2"
                        />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Enter a direct URL to a video file (MP4, WEBM, OGG, MOV)
                    </p>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Preview video if available */}
              {watchHeaderVideo && (
                <div className="mt-4 relative group">
                  <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800 bg-black/5">
                    <div className="aspect-video">
                      <video
                        src={watchHeaderVideo}
                        controls
                        className="w-full h-full"
                        poster="/placeholder.svg?height=480&width=640"
                        crossOrigin="anonymous"
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground truncate max-w-[80%]">
                      {watchHeaderVideo.split("/").pop() || "Video URL"}
                    </span>
                    <Button type="button" variant="outline" size="sm" onClick={removeHeaderVideo} className="text-xs">
                      Remove
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Working Hours Tab */}
        <TabsContent value="hours">
          <Card>
            <CardHeader>
              <CardTitle>Working Hours</CardTitle>
              <CardDescription>Set the working hours for each day of the week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {daysOfWeek.map((day) => (
                  <div key={day} className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-3">
                      <Label>{day}</Label>
                    </div>
                    <div className="col-span-3">
                      <Controller
                        name={`workingHours.${day}.closed`}
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value ? "closed" : "open"}
                            onValueChange={(value) => field.onChange(value === "closed")}
                            disabled={!editableFields[`workingHours_${day}_from`]}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="open">Open</SelectItem>
                              <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    {!watch(`workingHours.${day}.closed`) && (
                      <>
                        <div className="col-span-3">
                          <Controller
                            name={`workingHours.${day}.from`}
                            control={control}
                            render={({ field }) => (
                              <div className="relative">
                                <Input type="time" {...field} disabled={!editableFields[`workingHours_${day}_from`]} />
                                {isEditMode && (
                                  <EditButton
                                    size="sm"
                                    variant="subtle"
                                    tooltipText={`Edit ${day} from time`}
                                    onEdit={() =>
                                      setEditableFields((prev) => ({
                                        ...prev,
                                        [`workingHours_${day}_from`]: !prev[`workingHours_${day}_from`],
                                      }))
                                    }
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                                  />
                                )}
                              </div>
                            )}
                          />
                          {errors.workingHours?.[day]?.from && (
                            <p className="text-red-500">{errors.workingHours[day]?.from?.message}</p>
                          )}
                        </div>
                        <div className="col-span-3">
                          <Controller
                            name={`workingHours.${day}.to`}
                            control={control}
                            render={({ field }) => (
                              <div className="relative">
                                <Input type="time" {...field} disabled={!editableFields[`workingHours_${day}_to`]} />
                                {isEditMode && (
                                  <EditButton
                                    size="sm"
                                    variant="subtle"
                                    tooltipText={`Edit ${day} to time`}
                                    onEdit={() =>
                                      setEditableFields((prev) => ({
                                        ...prev,
                                        [`workingHours_${day}_to`]: !prev[`workingHours_${day}_to`],
                                      }))
                                    }
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                                  />
                                )}
                              </div>
                            )}
                          />
                          {errors.workingHours?.[day]?.to && (
                            <p className="text-red-500">{errors.workingHours[day]?.to?.message}</p>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gallery Tab */}
        <TabsContent value="gallery">
          <Card>
            <CardHeader>
              <CardTitle>Gallery Images</CardTitle>
              <CardDescription>Add additional images to showcase your park</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Gallery Image Uploader */}
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 transition-all hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <FileUploader
                    handleChange={handleGalleryImageUpload}
                    name="galleryFile"
                    types={["JPG", "PNG", "GIF"]}
                  >
                    <div className="flex flex-col items-center justify-center py-4 text-center">
                      <div className="mb-3 rounded-full bg-primary/10 p-3">
                        <ImageIcon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold">Add Gallery Images</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        or <span className="text-primary font-medium">browse files</span>
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">Supported formats: JPG, PNG, GIF</p>
                    </div>
                  </FileUploader>
                </div>

                {/* Gallery Preview */}
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4">Gallery Preview</h3>
                  {watch("galleryImages")?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {watch("galleryImages").map((image, index) => (
                        <div key={index} className="relative group">
                          <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
                            <img
                              src={image || "/placeholder.svg"}
                              alt={`Gallery image ${index + 1}`}
                              className="h-48 w-full object-cover transition-transform group-hover:scale-105"
                              crossOrigin="anonymous"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeGalleryImage(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No gallery images added yet. Add some images to showcase your park.
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rest of the tabs and form content... */}
      </Tabs>

      <div className="mt-4 flex justify-end">
        {isSubmitting || isUploadingImage || isUploadingHeaderVideo ? (
          <LoadingButton
            text={isEditMode ? "Updating..." : "Saving..."}
            className="text-white bg-blue-500 px-4 py-2 rounded-md"
          />
        ) : (
          <Button type="submit">{isEditMode ? "Update Park" : "Create Park"}</Button>
        )}
      </div>
    </form>
  )
}
