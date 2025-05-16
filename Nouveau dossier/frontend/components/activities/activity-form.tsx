"use client"
import { useEffect, useState, useRef } from "react"

import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, X, Loader2, ImageIcon, Play } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, Controller, useFieldArray } from "react-hook-form"
import { z } from "zod"
import { ActivityService } from "@/services/activity-service"
import type { AxiosError } from "axios"
import { ProtectedComponent } from "../protectedComponent"
import { useRouter } from "next/navigation"
import { FileUploader } from "react-drag-drop-files"
import { uploadMedia, deleteFile } from "@/utils/uploadImage"
import { ParkService } from "@/services/park-service"
import { EditButton } from "@/components/ui/edit-button"

// Define Zod schema for form validation
// Schema for Feature
const featureSchema = z.object({
  feature: z.string().min(3, "Feature name must be at least 3 characters").max(100),
  description: z.string().max(500),
  available: z.boolean().default(false),
})

// Schema for Category
const categorySchema = z.object({
  name: z.string().min(3, "Category name must be at least 3 characters").max(100),
  ageRequirement: z.string().min(1, "Age requirement is required"),
  heightRequirement: z.string().min(1, "Height requirement is required"),
  durationEstimated: z.string().min(1, "Duration is required"),
  descriptionofCategory: z.string().min(1, "Description is required").max(500),
  images: z.array(z.string().url().optional()).optional(),
  video: z.string().url().optional(),
})

// Schema for SubParcours
const subParcoursSchema = z.object({
  name: z.string().min(3, "Sub-parcours name must be at least 3 characters").max(100).optional(),
  numberOfWorkshops: z.number().min(0).optional(),
  durationEstimated: z.string().min(1, "Duration is required"),
  tyroliennes: z.number().min(0).optional(),
  description: z.string().max(500).optional(),
  images: z.array(z.string().url().optional()).optional(),
  video: z.string().url().optional(),
})

// Schema for Activity Details
const detailsSchema = z.object({
  déroulement: z.string().min(1, "Process description is required"),
  duration: z.string().min(1, "Duration is required"),
  features: z.array(z.string()).optional(),
})

// Schema for Difficulty
const difficultySchema = z
  .object({
    level: z.enum(["easy", "medium", "hard"]),
    description: z.string().optional(),
  })
  .optional()

// Main Activity Schema
const activitySchema = z.object({
  parkId: z.string().min(1, "Park is required"),
  name: z.string().min(3, "Activity name must be at least 3 characters").max(100),
  HeaderImage: z.string().min(1, "Header image is required"),
  HeaderVideo: z.string().optional(),
  images: z.array(z.string().url().optional()).default([]),
  isParcours: z.boolean(),
  description: z.string().max(1000).optional(),
  categories: z.array(categorySchema).optional(),
  subParcours: z.array(subParcoursSchema).optional(),
  features: z.array(featureSchema).optional(),
  details: detailsSchema,
  difficulty: difficultySchema,
})

type ActivityFormValues = z.infer<typeof activitySchema>

interface ActivityFormProps {
  activityId?: string
  parkId?: string
}

// Helper function to validate ObjectId
function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id)
}

// Accepted file types
const IMAGE_FILE_TYPES = ["JPG", "PNG", "GIF", "JPEG"]
const VIDEO_FILE_TYPES = ["MP4", "WEBM", "OGG", "MOV"]

export function ActivityForm({ activityId, parkId }: ActivityFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(!!activityId)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [editableFields, setEditableFields] = useState<Record<string, boolean>>({})
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isParcours, setIsParcours] = useState<boolean>(false)
  const [isUploadingHeaderImage, setIsUploadingHeaderImage] = useState(false)
  const [isUploadingHeaderVideo, setIsUploadingHeaderVideo] = useState(false)
  const [isUploadingImages, setIsUploadingImages] = useState(false)
  const [isUploadingCategoryImages, setIsUploadingCategoryImages] = useState<Record<number, boolean>>({})
  const [isUploadingCategoryVideos, setIsUploadingCategoryVideos] = useState<Record<number, boolean>>({})
  const [isUploadingSubParcoursImages, setIsUploadingSubParcoursImages] = useState<Record<number, boolean>>({})
  const [isUploadingSubParcoursVideos, setIsUploadingSubParcoursVideos] = useState<Record<number, boolean>>({})
  const videoRef = useRef<HTMLVideoElement>(null)
  const [parks, setParks] = useState<{ id: string; name: string }[]>([])
  const [isLoadingParks, setIsLoadingParks] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ActivityFormValues>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      name: "",
      parkId: parkId || "",
      HeaderImage: "",
      HeaderVideo: "",
      images: [],
      isParcours: false,
      description: "",
      features: [
        {
          feature: "",
          description: "",
          available: true,
        },
      ],
      details: {
        déroulement: "",
        duration: "",
        features: [],
      },
    },
    mode: "onChange",
  })

  // Watch the isParcours value to conditionally render form sections
  const watchIsParcours = watch("isParcours")
  const watchHeaderImage = watch("HeaderImage")
  const watchHeaderVideo = watch("HeaderVideo")
  const watchImages = watch("images")

  // Setup field arrays for repeatable sections
  const {
    fields: categoryFields,
    append: appendCategory,
    remove: removeCategory,
  } = useFieldArray({
    control,
    name: "categories",
  })

  const {
    fields: featureFields,
    append: appendFeature,
    remove: removeFeature,
  } = useFieldArray({
    control,
    name: "features",
  })

  const {
    fields: subParcoursFields,
    append: appendSubParcours,
    remove: removeSubParcours,
  } = useFieldArray({
    control,
    name: "subParcours",
  })

  const {
    fields: detailFeatureFields,
    append: appendDetailFeature,
    remove: removeDetailFeature,
  } = useFieldArray({
    control,
    name: "details.features",
  })

  // Fetch activity data if in edit mode
  useEffect(() => {
    async function loadActivityData() {
      if (!activityId) return

      try {
        setIsLoading(true)
        const res = await ActivityService.getActivityById(activityId)
        const response = res.data
        console.log("Fetched activity data:", response)

        // Extract activity data from the response
        const activityData = response.activity || response

        if (activityData) {
          // Set the isParcours state
          setIsParcours(activityData.isParcours || false)

          // Prepare the form data
          const formData: Partial<ActivityFormValues> = {
            name: activityData.name || "",
            parkId: activityData.parkId || "",
            HeaderImage: activityData.HeaderImage || "",
            HeaderVideo: activityData.HeaderVideo || "",
            images: activityData.images || [],
            isParcours: activityData.isParcours || false,
            description: activityData.description || "",
            features: activityData.features || [],
            details: activityData.details || {
              déroulement: "",
              duration: "",
              features: [],
            },
          }

          // Add categories or subParcours based on activity type
          if (activityData.isParcours) {
            formData.subParcours = activityData.subParcours || [
              {
                name: "",
                numberOfWorkshops: 0,
                durationEstimated: "",
                tyroliennes: 0,
                description: "",
                images: [],
                video: "",
              },
            ]
            formData.difficulty = activityData.difficulty || {
              level: "easy",
              description: "",
            }
          } else {
            formData.categories = activityData.categories || [
              {
                name: "",
                ageRequirement: "",
                heightRequirement: "",
                durationEstimated: "",
                descriptionofCategory: "",
                images: [],
                video: "",
              },
            ]
          }

          // Reset form with the fetched data
          reset(formData as ActivityFormValues)

          // Initialize all fields as non-editable in edit mode
          const initialEditableState: Record<string, boolean> = {}
          Object.keys(activityData).forEach((key) => {
            initialEditableState[key] = false
          })
          // Always make image fields editable
          initialEditableState.HeaderImage = true
          initialEditableState.HeaderVideo = true
          initialEditableState.images = true
          initialEditableState.categories = true
          initialEditableState.subParcours = true

          setEditableFields(initialEditableState)
        }
      } catch (error) {
        console.error("Error fetching activity:", error)
        setLoadError("Failed to load activity data. Please try again.")
        toast.error("Failed to load activity data")
      } finally {
        setIsLoading(false)
      }
    }

    loadActivityData()
  }, [activityId, reset])

  // Fetch parks based on mode (edit or new)
  useEffect(() => {
    async function fetchParks() {
      try {
        setIsLoadingParks(true)

        if (activityId) {
          // In edit mode, we already have the park ID from the activity data
          // We don't need to fetch all parks, just make sure we have the current one selected
        } else {
          // In new mode, fetch the parks for current user
          const response = await ParkService.getParkForCurrentUser()
          if (response.data && Array.isArray(response.data)) {
            // Handle array of parks
            const parksList = response.data.map((park) => ({
              id: park._id,
              name: park.name,
            }))

            setParks(parksList)

            // If there's only one park, auto-select it
            if (parksList.length === 1) {
              setValue("parkId", parksList[0].id, { shouldValidate: true })
            }
            // If there are multiple parks, let the user choose
          } else if (response.data) {
            // Handle single park object (just in case the API changes)
            setParks([{ id: response.data._id, name: response.data.name }])
            setValue("parkId", response.data._id, { shouldValidate: true })
          } else {
            // If no park is found or user has no assigned parks
            toast.error("No parks available. Please contact an administrator.")
          }
        }
      } catch (error) {
        console.error("Error fetching parks:", error)
        toast.error("Failed to load parks")
      } finally {
        setIsLoadingParks(false)
      }
    }

    fetchParks()
  }, [activityId, setValue])

  // Custom validation function to check form data before submission
  const validateFormData = (data: ActivityFormValues) => {
    const { isParcours, categories, subParcours } = data
    const errors: Record<string, string> = {}

    if (isParcours) {
      // For Parcours, validate subParcours
      if (!subParcours || subParcours.length === 0) {
        errors.subParcours = "Sub-parcours are required for parcours activities"
      }
    } else {
      // For Activities, validate categories
      if (!categories || categories.length === 0) {
        errors.categories = "Categories are required for non-parcours activities"
      }
    }

    return errors
  }

  const onSubmit = async (data: ActivityFormValues) => {
    try {
      console.log("Submitting form data:", data)
      setUpdateError(null)

      // Perform custom validation
      const validationErrors = validateFormData(data)
      if (Object.keys(validationErrors).length > 0) {
        // Display validation errors
        Object.entries(validationErrors).forEach(([field, message]) => {
          toast.error(`${field}: ${message}`)
        })
        return
      }

      // Clean up the data before sending to the server
      const cleanData = JSON.parse(JSON.stringify(data))

      // Remove subParcours if it's not a parcours
      if (!cleanData.isParcours) {
        delete cleanData.subParcours
        delete cleanData.difficulty
      }

      // Remove categories if it's a parcours
      if (cleanData.isParcours) {
        delete cleanData.categories
      }

      // Remove empty video fields
      if (!cleanData.HeaderVideo) {
        delete cleanData.HeaderVideo
      }

      // Filter out empty video fields from categories
      if (cleanData.categories && Array.isArray(cleanData.categories)) {
        cleanData.categories = cleanData.categories.map((category) => {
          const updatedCategory = { ...category }
          if (!updatedCategory.video) {
            delete updatedCategory.video
          }
          return updatedCategory
        })
      }

      // Filter out empty video fields from subParcours
      if (cleanData.subParcours && Array.isArray(cleanData.subParcours)) {
        cleanData.subParcours = cleanData.subParcours.map((subParcours) => {
          const updatedSubParcours = { ...subParcours }
          if (!updatedSubParcours.video) {
            delete updatedSubParcours.video
          }
          return updatedSubParcours
        })
      }

      if (activityId) {
        // Update existing activity
        try {
          console.log("Updating activity with ID:", activityId)
          console.log("Update data:", cleanData)

          // Use a direct fetch call to debug the API response
          const apiUrl = `/api/activity/${activityId}`
          console.log("API URL:", apiUrl)

          // First try with the ActivityService
          const response = await ActivityService.updateActivity(activityId, cleanData)
          console.log("Update response:", response)

          toast.success("Activity updated successfully!")

          // Refresh the page to show updated data
          setTimeout(() => {
            router.refresh()
            router.push("/dashboard/activities")
          }, 1000)
        } catch (error) {
          console.error("Error updating activity:", error)

          // Try to extract more detailed error information
          if (error.response) {
            console.error("Error response data:", error.response.data)
            console.error("Error response status:", error.response.status)

            if (error.response.data && error.response.data.message) {
              setUpdateError(`Failed to update activity: ${error.response.data.message}`)
              toast.error(`Update failed: ${error.response.data.message}`)
            } else {
              setUpdateError(`Failed to update activity. Server returned status: ${error.response.status}`)
              toast.error(`Update failed with status: ${error.response.status}`)
            }
          } else if (error.request) {
            setUpdateError("Failed to update activity. No response received from server.")
            toast.error("No response received from server. Please check your connection.")
          } else {
            setUpdateError(`Failed to update activity: ${error.message}`)
            toast.error(`Error: ${error.message}`)
          }
        }
      } else {
        // Create new activity
        try {
          await ActivityService.addNewActivity(cleanData.parkId, cleanData)
          toast.success("Activity created successfully!")
          // Reset form after successful creation
          reset()
          // Redirect to activities list
          setTimeout(() => {
            router.push("/dashboard/activities")
          }, 1000)
        } catch (error) {
          console.error("Error creating activity:", error)
          handleApiError(error)
        }
      }
    } catch (error) {
      console.error(`Error ${activityId ? "updating" : "creating"} activity:`, error)
      setUpdateError(`Error ${activityId ? "updating" : "creating"} activity. Please try again.`)
      handleApiError(error)
    }
  }

  // Add this helper function for error handling
  const handleApiError = (error) => {
    const axiosError = error as AxiosError<any>

    if (axiosError.response) {
      const { data, status } = axiosError.response

      if (data.errors) {
        // Handle validation errors
        Object.entries(data.errors).forEach(([field, message]) => {
          toast.error(`${field}: ${message}`)
        })
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

  const toggleEditable = (field: string) => {
    setEditableFields((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  // Handle header image upload
  const handleHeaderImageUpload = async (file: File) => {
    try {
      setIsUploadingHeaderImage(true)

      const imageUrl = await uploadMedia(file)
      if (imageUrl) {
        setValue("HeaderImage", imageUrl, { shouldValidate: true })
        toast.success("Header image uploaded successfully")

        // If in edit mode, make all fields editable after media upload
        if (activityId) {
          setEditableFields((prev) => ({
            ...prev,
            name: true,
            parkId: true,
            isParcours: true,
            description: true,
            features: true,
            details: true,
            difficulty: true,
            categories: true,
            subParcours: true,
          }))
        }
      }
    } catch (error) {
      console.error("Error uploading header image:", error)
      toast.error("Failed to upload header image")
    } finally {
      setIsUploadingHeaderImage(false)
    }
  }

  // Handle header video upload
  const handleHeaderVideoUpload = async (file: File) => {
    try {
      setIsUploadingHeaderVideo(true)

      const videoUrl = await uploadMedia(file)
      if (videoUrl) {
        setValue("HeaderVideo", videoUrl, { shouldValidate: true })
        toast.success("Header video uploaded successfully")
      }
    } catch (error) {
      console.error("Error uploading header video:", error)
      toast.error("Failed to upload header video")
    } finally {
      setIsUploadingHeaderVideo(false)
    }
  }

  // Handle activity images upload
  const handleImagesChange = async (file: File) => {
    try {
      setIsUploadingImages(true)
      const imageUrl = await uploadMedia(file)
      if (imageUrl) {
        const currentImages = getValues("images") || []
        setValue("images", [...currentImages, imageUrl], { shouldValidate: true })
        toast.success("Image uploaded successfully")
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      toast.error("Failed to upload image")
    } finally {
      setIsUploadingImages(false)
    }
  }

  // Handle category image upload
  const handleCategoryImageChange = async (file: File, categoryIndex: number) => {
    try {
      setIsUploadingCategoryImages((prev) => ({ ...prev, [categoryIndex]: true }))
      const imageUrl = await uploadMedia(file)
      if (imageUrl) {
        const currentImages = getValues(`categories.${categoryIndex}.images`) || []
        setValue(`categories.${categoryIndex}.images`, [...currentImages, imageUrl], { shouldValidate: true })
        toast.success("Category image uploaded successfully")
      }
    } catch (error) {
      console.error("Error uploading category image:", error)
      toast.error("Failed to upload category image")
    } finally {
      setIsUploadingCategoryImages((prev) => ({ ...prev, [categoryIndex]: false }))
    }
  }

  // Handle category video upload
  const handleCategoryVideoUpload = async (file: File, categoryIndex: number) => {
    try {
      setIsUploadingCategoryVideos((prev) => ({ ...prev, [categoryIndex]: true }))
      const videoUrl = await uploadMedia(file)
      if (videoUrl) {
        setValue(`categories.${categoryIndex}.video`, videoUrl, { shouldValidate: true })
        toast.success("Category video uploaded successfully")
      }
    } catch (error) {
      console.error("Error uploading category video:", error)
      toast.error("Failed to upload category video")
    } finally {
      setIsUploadingCategoryVideos((prev) => ({ ...prev, [categoryIndex]: false }))
    }
  }

  // Handle subParcours image upload
  const handleSubParcoursImageChange = async (file: File, subParcoursIndex: number) => {
    try {
      setIsUploadingSubParcoursImages((prev) => ({ ...prev, [subParcoursIndex]: true }))
      const imageUrl = await uploadMedia(file)
      if (imageUrl) {
        const currentImages = getValues(`subParcours.${subParcoursIndex}.images`) || []
        setValue(`subParcours.${subParcoursIndex}.images`, [...currentImages, imageUrl], { shouldValidate: true })
        toast.success("Sub-parcours image uploaded successfully")
      }
    } catch (error) {
      console.error("Error uploading sub-parcours image:", error)
      toast.error("Failed to upload sub-parcours image")
    } finally {
      setIsUploadingSubParcoursImages((prev) => ({ ...prev, [subParcoursIndex]: false }))
    }
  }

  // Handle subParcours video upload
  const handleSubParcoursVideoUpload = async (file: File, subParcoursIndex: number) => {
    try {
      setIsUploadingSubParcoursVideos((prev) => ({ ...prev, [subParcoursIndex]: true }))
      const videoUrl = await uploadMedia(file)
      if (videoUrl) {
        setValue(`subParcours.${subParcoursIndex}.video`, videoUrl, { shouldValidate: true })
        toast.success("Sub-parcours video uploaded successfully")
      }
    } catch (error) {
      console.error("Error uploading sub-parcours video:", error)
      toast.error("Failed to upload sub-parcours video")
    } finally {
      setIsUploadingSubParcoursVideos((prev) => ({ ...prev, [subParcoursIndex]: false }))
    }
  }

  // Remove image from array
  const removeImage = (index: number) => {
    const currentImages = [...getValues("images")]
    const imageUrl = currentImages[index]

    // Try to delete the file from storage if possible
    if (imageUrl) {
      const filename = imageUrl.split("/").pop()
      if (filename) {
        deleteFile(filename).catch((err) => {
          console.error("Error deleting image file:", err)
        })
      }
    }

    currentImages.splice(index, 1)
    setValue("images", currentImages, { shouldValidate: true })
    toast.success("Image removed")
  }

  // Remove header image
  const removeHeaderImage = () => {
    const imageUrl = getValues("HeaderImage")

    // Try to delete the file from storage if possible
    if (imageUrl) {
      const filename = imageUrl.split("/").pop()
      if (filename) {
        deleteFile(filename).catch((err) => {
          console.error("Error deleting header image file:", err)
        })
      }
    }

    setValue("HeaderImage", "", { shouldValidate: true })
    toast.info("Header image removed. Please upload a new one before saving.")
  }

  // Remove header video
  const removeHeaderVideo = () => {
    const videoUrl = getValues("HeaderVideo")

    // Try to delete the file from storage if possible
    if (videoUrl) {
      const filename = videoUrl.split("/").pop()
      if (filename) {
        deleteFile(filename).catch((err) => {
          console.error("Error deleting header video file:", err)
        })
      }
    }

    setValue("HeaderVideo", "", { shouldValidate: true })
    toast.info("Header video removed")
  }

  // Remove category image
  const removeCategoryImage = (categoryIndex: number, imageIndex: number) => {
    const currentImages = [...(getValues(`categories.${categoryIndex}.images`) || [])]
    const imageUrl = currentImages[imageIndex]

    // Try to delete the file from storage if possible
    if (imageUrl) {
      const filename = imageUrl.split("/").pop()
      if (filename) {
        deleteFile(filename).catch((err) => {
          console.error("Error deleting category image file:", err)
        })
      }
    }

    currentImages.splice(imageIndex, 1)
    setValue(`categories.${categoryIndex}.images`, currentImages, { shouldValidate: true })
    toast.success("Category image removed")
  }

  // Remove category video
  const removeCategoryVideo = (categoryIndex: number) => {
    const videoUrl = getValues(`categories.${categoryIndex}.video`)

    // Try to delete the file from storage if possible
    if (videoUrl) {
      const filename = videoUrl.split("/").pop()
      if (filename) {
        deleteFile(filename).catch((err) => {
          console.error("Error deleting category video file:", err)
        })
      }
    }

    setValue(`categories.${categoryIndex}.video`, "", { shouldValidate: false })
    toast.success("Category video removed")
  }

  // Remove subParcours image
  const removeSubParcoursImage = (subParcoursIndex: number, imageIndex: number) => {
    const currentImages = [...(getValues(`subParcours.${subParcoursIndex}.images`) || [])]
    const imageUrl = currentImages[imageIndex]

    // Try to delete the file from storage if possible
    if (imageUrl) {
      const filename = imageUrl.split("/").pop()
      if (filename) {
        deleteFile(filename).catch((err) => {
          console.error("Error deleting sub-parcours image file:", err)
        })
      }
    }

    currentImages.splice(imageIndex, 1)
    setValue(`subParcours.${subParcoursIndex}.images`, currentImages, { shouldValidate: true })
    toast.success("Sub-parcours image removed")
  }

  // Remove subParcours video
  const removeSubParcoursVideo = (subParcoursIndex: number) => {
    const videoUrl = getValues(`subParcours.${subParcoursIndex}.video`)

    // Try to delete the file from storage if possible
    if (videoUrl) {
      const filename = videoUrl.split("/").pop()
      if (filename) {
        deleteFile(filename).catch((err) => {
          console.error("Error deleting sub-parcours video file:", err)
        })
      }
    }

    setValue(`subParcours.${subParcoursIndex}.video`, "", { shouldValidate: false })
    toast.success("Sub-parcours video removed")
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading activity data...</span>
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
      {updateError && (
        <div className="p-4 mb-4 border border-red-300 bg-red-50 rounded-md text-red-800">
          <h3 className="font-semibold mb-2">Error</h3>
          <p>{updateError}</p>
        </div>
      )}

      <Tabs defaultValue="general">
        <TabsList className="mb-4">
          <TabsTrigger value="general">General Information</TabsTrigger>
          <TabsTrigger value="media">Images & Media</TabsTrigger>
          {!watchIsParcours && <TabsTrigger value="categories">Categories</TabsTrigger>}
          {watchIsParcours && <TabsTrigger value="subparcours">Sub-Parcours</TabsTrigger>}
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          {watchIsParcours && <TabsTrigger value="difficulty">Difficulty</TabsTrigger>}
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>{activityId ? "Edit Activity" : "Create Activity"}</CardTitle>
              <CardDescription>Basic information about the activity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Activity Name</Label>
                <div className="relative">
                  <Input
                    id="name"
                    {...register("name")}
                    placeholder="Enter activity name"
                    disabled={activityId && !editableFields.name}
                  />
                  {activityId && (
                    <EditButton
                      size="sm"
                      variant="subtle"
                      tooltipText="Edit name"
                      onEdit={() => toggleEditable("name")}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    />
                  )}
                </div>
                {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <ProtectedComponent>
                    <Label htmlFor="parkId">Park</Label>
                    <Controller
                      name="parkId"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={(activityId && !editableFields.parkId) || isLoadingParks}
                        >
                          <SelectTrigger>
                            {isLoadingParks ? (
                              <div className="flex items-center">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                <span>Loading park...</span>
                              </div>
                            ) : (
                              <SelectValue placeholder="Select a park" />
                            )}
                          </SelectTrigger>
                          <SelectContent>
                            {parks.map((park) => (
                              <SelectItem key={park.id} value={park.id}>
                                {park.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </ProtectedComponent>
                  {activityId && (
                    <EditButton
                      size="sm"
                      variant="subtle"
                      tooltipText="Edit park"
                      onEdit={() => toggleEditable("parkId")}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    />
                  )}
                </div>
                {errors.parkId && <p className="text-red-500 text-sm">{errors.parkId.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <div className="relative">
                  <Textarea
                    id="description"
                    {...register("description")}
                    placeholder="Enter activity description"
                    rows={4}
                    disabled={activityId && !editableFields.description}
                  />
                  {activityId && (
                    <EditButton
                      size="sm"
                      variant="subtle"
                      tooltipText="Edit description"
                      onEdit={() => toggleEditable("description")}
                      className="absolute right-2 top-2"
                    />
                  )}
                </div>
                {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="isParcours">Activity Type</Label>
                <div className="relative">
                  <Controller
                    name="isParcours"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value ? "true" : "false"}
                        onValueChange={(value) => {
                          const isParcours = value === "true"
                          field.onChange(isParcours)
                          setIsParcours(isParcours)
                        }}
                        disabled={activityId && !editableFields.isParcours}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select activity type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Parcours</SelectItem>
                          <SelectItem value="false">Activity</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {activityId && (
                    <EditButton
                      size="sm"
                      variant="subtle"
                      tooltipText="Edit activity type"
                      onEdit={() => toggleEditable("isParcours")}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    />
                  )}
                </div>
                {errors.isParcours && <p className="text-red-500 text-sm">{errors.isParcours.message}</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media">
          <Card>
            <CardHeader>
              <CardTitle>Activity Media</CardTitle>
              <CardDescription>Upload header image, video and additional images for this activity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Header Image Section */}
              <div className="space-y-4">
                <Label htmlFor="headerImage">Header Image (Required)</Label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 transition-all hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <FileUploader
                    handleChange={handleHeaderImageUpload}
                    name="headerImage"
                    types={IMAGE_FILE_TYPES}
                    disabled={isUploadingHeaderImage}
                  >
                    <div className="flex flex-col items-center justify-center py-4 text-center">
                      <div className="mb-3 rounded-full bg-primary/10 p-3">
                        {isUploadingHeaderImage ? (
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        ) : (
                          <ImageIcon className="h-6 w-6 text-primary" />
                        )}
                      </div>
                      <h3 className="text-lg font-semibold">Drag & Drop your header image here</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        or <span className="text-primary font-medium">browse files</span>
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">Supported formats: JPG, PNG, GIF</p>
                    </div>
                  </FileUploader>
                </div>

                {/* Preview header image if available */}
                {watchHeaderImage && (
                  <div className="mt-4 relative group">
                    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800 bg-black/5">
                      <img
                        src={watchHeaderImage || "/placeholder.svg"}
                        alt="Header image"
                        className="w-full h-auto max-h-80 object-contain"
                        crossOrigin="anonymous"
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm text-muted-foreground truncate max-w-[80%]">
                        {watchHeaderImage.split("/").pop() || "Header image"}
                      </span>
                      <Button type="button" variant="outline" size="sm" onClick={removeHeaderImage} className="text-xs">
                        Remove
                      </Button>
                    </div>
                  </div>
                )}
                {errors.HeaderImage && <p className="text-red-500 text-sm">{errors.HeaderImage.message}</p>}
              </div>

              {/* Header Video Section */}
              <div className="space-y-4">
                <Label htmlFor="headerVideo">Header Video (Optional)</Label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 transition-all hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <FileUploader
                    handleChange={handleHeaderVideoUpload}
                    name="headerVideo"
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
                      <h3 className="text-lg font-semibold">Drag & Drop your header video here</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        or <span className="text-primary font-medium">browse files</span>
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">Supported formats: MP4, WEBM, OGG, MOV</p>
                    </div>
                  </FileUploader>
                </div>

                {/* Preview header video if available */}
                {watchHeaderVideo && (
                  <div className="mt-4 relative group">
                    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800 bg-black/5">
                      <video
                        ref={videoRef}
                        src={watchHeaderVideo}
                        controls
                        className="w-full h-auto"
                        poster="/placeholder.svg?height=480&width=640"
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm text-muted-foreground truncate max-w-[80%]">
                        {watchHeaderVideo.split("/").pop() || "Header video"}
                      </span>
                      <Button type="button" variant="outline" size="sm" onClick={removeHeaderVideo} className="text-xs">
                        Remove
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Images Section */}
              <div className="space-y-4">
                <Label htmlFor="additionalImages">Additional Images (Optional)</Label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 transition-all hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <FileUploader
                    handleChange={handleImagesChange}
                    name="additionalImages"
                    types={IMAGE_FILE_TYPES}
                    disabled={isUploadingImages}
                  >
                    <div className="flex flex-col items-center justify-center py-4 text-center">
                      <div className="mb-3 rounded-full bg-primary/10 p-3">
                        {isUploadingImages ? (
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        ) : (
                          <ImageIcon className="h-6 w-6 text-primary" />
                        )}
                      </div>
                      <h3 className="text-lg font-semibold">Drag & Drop additional images here</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        or <span className="text-primary font-medium">browse files</span>
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">Supported formats: JPG, PNG, GIF</p>
                    </div>
                  </FileUploader>
                </div>

                {/* Preview uploaded images if available */}
                {watchImages && watchImages.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                    {watchImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
                          <img
                            src={image || "/placeholder.svg"}
                            alt={`Activity image ${index + 1}`}
                            className="h-32 w-full object-cover transition-transform group-hover:scale-105"
                            crossOrigin="anonymous"
                          />
                        </div>
                        <div className="absolute top-2 right-2">
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="w-full h-32 rounded-lg border border-dashed border-gray-300 flex items-center justify-center bg-gray-50 mt-4">
                    <div className="text-center">
                      <ImageIcon className="mx-auto h-8 w-8 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-500">No additional images uploaded</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {!watchIsParcours && (
          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <CardTitle>Categories</CardTitle>
                <CardDescription>Define different categories for this activity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {categoryFields.map((field, index) => (
                  <div key={field.id} className="rounded-lg border p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Category {index + 1}</h3>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCategory(index)}
                        disabled={categoryFields.length === 1 || (activityId && !editableFields.categories)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor={`category-name-${index}`}>Name</Label>
                        <div className="relative">
                          <Input
                            id={`category-name-${index}`}
                            {...register(`categories.${index}.name`)}
                            placeholder="Category name"
                            disabled={activityId && !editableFields.categories}
                          />
                          {activityId && (
                            <EditButton
                              size="sm"
                              variant="subtle"
                              tooltipText="Edit category name"
                              onEdit={() => toggleEditable("categories")}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2"
                            />
                          )}
                        </div>
                        {errors.categories?.[index]?.name && (
                          <p className="text-red-500 text-sm">{errors.categories[index]?.name?.message}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor={`category-age-${index}`}>Age Requirement</Label>
                          <div className="relative">
                            <Input
                              id={`category-age-${index}`}
                              {...register(`categories.${index}.ageRequirement`)}
                              placeholder="e.g., 8+"
                              disabled={activityId && !editableFields.categories}
                            />
                            {activityId && (
                              <EditButton
                                size="sm"
                                variant="subtle"
                                tooltipText="Edit age requirement"
                                onEdit={() => toggleEditable("categories")}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                              />
                            )}
                          </div>
                          {errors.categories?.[index]?.ageRequirement && (
                            <p className="text-red-500 text-sm">{errors.categories[index]?.ageRequirement?.message}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`category-height-${index}`}>Height Requirement</Label>
                          <div className="relative">
                            <Input
                              id={`category-height-${index}`}
                              {...register(`categories.${index}.heightRequirement`)}
                              placeholder="e.g., 120cm+"
                              disabled={activityId && !editableFields.categories}
                            />
                            {activityId && (
                              <EditButton
                                size="sm"
                                variant="subtle"
                                tooltipText="Edit height requirement"
                                onEdit={() => toggleEditable("categories")}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                              />
                            )}
                          </div>
                          {errors.categories?.[index]?.heightRequirement && (
                            <p className="text-red-500 text-sm">
                              {errors.categories[index]?.heightRequirement?.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`category-duration-${index}`}>Duration</Label>
                        <div className="relative">
                          <Input
                            id={`category-duration-${index}`}
                            {...register(`categories.${index}.durationEstimated`)}
                            placeholder="e.g., 2 hours"
                            disabled={activityId && !editableFields.categories}
                          />
                          {activityId && (
                            <EditButton
                              size="sm"
                              variant="subtle"
                              tooltipText="Edit duration"
                              onEdit={() => toggleEditable("categories")}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2"
                            />
                          )}
                        </div>
                        {errors.categories?.[index]?.durationEstimated && (
                          <p className="text-red-500 text-sm">{errors.categories[index]?.durationEstimated?.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`category-description-${index}`}>Description</Label>
                        <div className="relative">
                          <Textarea
                            id={`category-description-${index}`}
                            {...register(`categories.${index}.descriptionofCategory`)}
                            placeholder="Category description"
                            rows={3}
                            disabled={activityId && !editableFields.categories}
                          />
                          {activityId && (
                            <EditButton
                              size="sm"
                              variant="subtle"
                              tooltipText="Edit description"
                              onEdit={() => toggleEditable("categories")}
                              className="absolute right-2 top-2"
                            />
                          )}
                        </div>
                        {errors.categories?.[index]?.descriptionofCategory && (
                          <p className="text-red-500 text-sm">
                            {errors.categories[index]?.descriptionofCategory?.message}
                          </p>
                        )}
                      </div>

                      {/* Category Images */}
                      <div className="space-y-2">
                        <Label>Category Images</Label>
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 transition-all hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <FileUploader
                            handleChange={(file) => handleCategoryImageChange(file, index)}
                            name={`category-images-${index}`}
                            types={IMAGE_FILE_TYPES}
                            disabled={isUploadingCategoryImages[index]}
                          >
                            <div className="flex flex-col items-center justify-center py-4 text-center">
                              <div className="mb-3 rounded-full bg-primary/10 p-3">
                                {isUploadingCategoryImages[index] ? (
                                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                ) : (
                                  <ImageIcon className="h-6 w-6 text-primary" />
                                )}
                              </div>
                              <h3 className="text-lg font-semibold">Drag & Drop category images here</h3>
                              <p className="mt-1 text-sm text-muted-foreground">
                                or <span className="text-primary font-medium">browse files</span>
                              </p>
                              <p className="mt-2 text-xs text-muted-foreground">Supported formats: JPG, PNG, GIF</p>
                            </div>
                          </FileUploader>
                        </div>

                        {/* Preview category images */}
                        {watch(`categories.${index}.images`)?.length > 0 ? (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4">
                            {watch(`categories.${index}.images`)?.map((image, imageIndex) => (
                              <div key={imageIndex} className="relative group">
                                <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
                                  <img
                                    src={image || "/placeholder.svg"}
                                    alt={`Category image ${imageIndex + 1}`}
                                    className="h-24 w-full object-cover transition-transform group-hover:scale-105"
                                    crossOrigin="anonymous"
                                  />
                                </div>
                                <div className="absolute top-1 right-1">
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => removeCategoryImage(index, imageIndex)}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="w-full h-24 rounded-lg border border-dashed border-gray-300 flex items-center justify-center bg-gray-50 mt-4">
                            <div className="text-center">
                              <ImageIcon className="mx-auto h-6 w-6 text-gray-400" />
                              <p className="mt-1 text-xs text-gray-500">No category images uploaded</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Category Video */}
                      <div className="space-y-2">
                        <Label htmlFor={`category-video-${index}`}>Video (Optional)</Label>
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 transition-all hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <FileUploader
                            handleChange={(file) => handleCategoryVideoUpload(file, index)}
                            name={`category-video-${index}`}
                            types={VIDEO_FILE_TYPES}
                            disabled={isUploadingCategoryVideos[index]}
                          >
                            <div className="flex flex-col items-center justify-center py-4 text-center">
                              <div className="mb-3 rounded-full bg-primary/10 p-3">
                                {isUploadingCategoryVideos[index] ? (
                                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                ) : (
                                  <Play className="h-6 w-6 text-primary" />
                                )}
                              </div>
                              <h3 className="text-lg font-semibold">Drag & Drop category video here</h3>
                              <p className="mt-1 text-sm text-muted-foreground">
                                or <span className="text-primary font-medium">browse files</span>
                              </p>
                              <p className="mt-2 text-xs text-muted-foreground">
                                Supported formats: MP4, WEBM, OGG, MOV
                              </p>
                            </div>
                          </FileUploader>
                        </div>

                        {/* Preview category video if available */}
                        {watch(`categories.${index}.video`) && (
                          <div className="mt-4 relative group">
                            <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800 bg-black/5">
                              <video
                                src={watch(`categories.${index}.video`)}
                                controls
                                className="w-full h-auto"
                                poster="/placeholder.svg?height=240&width=320"
                              >
                                Your browser does not support the video tag.
                              </video>
                            </div>
                            <div className="mt-2 flex items-center justify-between">
                              <span className="text-sm text-muted-foreground truncate max-w-[80%]">
                                {watch(`categories.${index}.video`)?.split("/").pop() || "Category video"}
                              </span>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeCategoryVideo(index)}
                                className="text-xs"
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    appendCategory({
                      name: "",
                      ageRequirement: "",
                      heightRequirement: "",
                      durationEstimated: "",
                      descriptionofCategory: "",
                      images: [],
                      video: "",
                    })
                  }
                  className="w-full"
                  disabled={activityId && !editableFields.categories}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Category
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {watchIsParcours && (
          <TabsContent value="subparcours">
            <Card>
              <CardHeader>
                <CardTitle>Sub-Parcours</CardTitle>
                <CardDescription>Define different sub-parcours for this activity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {subParcoursFields.map((field, index) => (
                  <div key={field.id} className="rounded-lg border p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Sub-Parcours {index + 1}</h3>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSubParcours(index)}
                        disabled={subParcoursFields.length === 1 || (activityId && !editableFields.subParcours)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor={`subparcours-name-${index}`}>Name</Label>
                        <div className="relative">
                          <Input
                            id={`subparcours-name-${index}`}
                            {...register(`subParcours.${index}.name`)}
                            placeholder="Sub-Parcours name"
                            disabled={activityId && !editableFields.subParcours}
                          />
                          {activityId && (
                            <EditButton
                              size="sm"
                              variant="subtle"
                              tooltipText="Edit sub-parcours name"
                              onEdit={() => toggleEditable("subParcours")}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2"
                            />
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label htmlFor={`subparcours-workshops-${index}`}>Number of Workshops</Label>
                          <div className="relative">
                            <Input
                              id={`subparcours-workshops-${index}`}
                              type="number"
                              {...register(`subParcours.${index}.numberOfWorkshops`, { valueAsNumber: true })}
                              placeholder="e.g., 5"
                              disabled={activityId && !editableFields.subParcours}
                            />
                            {activityId && (
                              <EditButton
                                size="sm"
                                variant="subtle"
                                tooltipText="Edit number of workshops"
                                onEdit={() => toggleEditable("subParcours")}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                              />
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`subparcours-tyroliennes-${index}`}>Number of Tyroliennes</Label>
                          <div className="relative">
                            <Input
                              id={`subparcours-tyroliennes-${index}`}
                              type="number"
                              {...register(`subParcours.${index}.tyroliennes`, { valueAsNumber: true })}
                              placeholder="e.g., 2"
                              disabled={activityId && !editableFields.subParcours}
                            />
                            {activityId && (
                              <EditButton
                                size="sm"
                                variant="subtle"
                                tooltipText="Edit number of tyroliennes"
                                onEdit={() => toggleEditable("subParcours")}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                              />
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`subparcours-duration-${index}`}>Duration</Label>
                          <div className="relative">
                            <Input
                              id={`subparcours-duration-${index}`}
                              {...register(`subParcours.${index}.durationEstimated`)}
                              placeholder="e.g., 2 hours"
                              disabled={activityId && !editableFields.subParcours}
                            />
                            {activityId && (
                              <EditButton
                                size="sm"
                                variant="subtle"
                                tooltipText="Edit duration"
                                onEdit={() => toggleEditable("subParcours")}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                              />
                            )}
                          </div>
                          {errors.subParcours?.[index]?.durationEstimated && (
                            <p className="text-red-500 text-sm">
                              {errors.subParcours[index]?.durationEstimated?.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`subparcours-description-${index}`}>Description</Label>
                        <div className="relative">
                          <Textarea
                            id={`subparcours-description-${index}`}
                            {...register(`subParcours.${index}.description`)}
                            placeholder="Sub-Parcours description"
                            rows={3}
                            disabled={activityId && !editableFields.subParcours}
                          />
                          {activityId && (
                            <EditButton
                              size="sm"
                              variant="subtle"
                              tooltipText="Edit description"
                              onEdit={() => toggleEditable("subParcours")}
                              className="absolute right-2 top-2"
                            />
                          )}
                        </div>
                      </div>

                      {/* SubParcours Images */}
                      <div className="space-y-2">
                        <Label>Sub-Parcours Images</Label>
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 transition-all hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <FileUploader
                            handleChange={(file) => handleSubParcoursImageChange(file, index)}
                            name={`subparcours-images-${index}`}
                            types={IMAGE_FILE_TYPES}
                            disabled={isUploadingSubParcoursImages[index]}
                          >
                            <div className="flex flex-col items-center justify-center py-4 text-center">
                              <div className="mb-3 rounded-full bg-primary/10 p-3">
                                {isUploadingSubParcoursImages[index] ? (
                                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                ) : (
                                  <ImageIcon className="h-6 w-6 text-primary" />
                                )}
                              </div>
                              <h3 className="text-lg font-semibold">Drag & Drop sub-parcours images here</h3>
                              <p className="mt-1 text-sm text-muted-foreground">
                                or <span className="text-primary font-medium">browse files</span>
                              </p>
                              <p className="mt-2 text-xs text-muted-foreground">Supported formats: JPG, PNG, GIF</p>
                            </div>
                          </FileUploader>
                        </div>

                        {/* Preview subParcours images */}
                        {watch(`subParcours.${index}.images`)?.length > 0 ? (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4">
                            {watch(`subParcours.${index}.images`)?.map((image, imageIndex) => (
                              <div key={imageIndex} className="relative group">
                                <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
                                  <img
                                    src={image || "/placeholder.svg"}
                                    alt={`Sub-Parcours image ${imageIndex + 1}`}
                                    className="h-24 w-full object-cover transition-transform group-hover:scale-105"
                                    crossOrigin="anonymous"
                                  />
                                </div>
                                <div className="absolute top-1 right-1">
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => removeSubParcoursImage(index, imageIndex)}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="w-full h-24 rounded-lg border border-dashed border-gray-300 flex items-center justify-center bg-gray-50 mt-4">
                            <div className="text-center">
                              <ImageIcon className="mx-auto h-6 w-6 text-gray-400" />
                              <p className="mt-1 text-xs text-gray-500">No sub-parcours images uploaded</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* SubParcours Video */}
                      <div className="space-y-2">
                        <Label htmlFor={`subparcours-video-${index}`}>Video (Optional)</Label>
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 transition-all hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <FileUploader
                            handleChange={(file) => handleSubParcoursVideoUpload(file, index)}
                            name={`subparcours-video-${index}`}
                            types={VIDEO_FILE_TYPES}
                            disabled={isUploadingSubParcoursVideos[index]}
                          >
                            <div className="flex flex-col items-center justify-center py-4 text-center">
                              <div className="mb-3 rounded-full bg-primary/10 p-3">
                                {isUploadingSubParcoursVideos[index] ? (
                                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                ) : (
                                  <Play className="h-6 w-6 text-primary" />
                                )}
                              </div>
                              <h3 className="text-lg font-semibold">Drag & Drop sub-parcours video here</h3>
                              <p className="mt-1 text-sm text-muted-foreground">
                                or <span className="text-primary font-medium">browse files</span>
                              </p>
                              <p className="mt-2 text-xs text-muted-foreground">
                                Supported formats: MP4, WEBM, OGG, MOV
                              </p>
                            </div>
                          </FileUploader>
                        </div>

                        {/* Preview subParcours video if available */}
                        {watch(`subParcours.${index}.video`) && (
                          <div className="mt-4 relative group">
                            <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800 bg-black/5">
                              <video
                                src={watch(`subParcours.${index}.video`)}
                                controls
                                className="w-full h-auto"
                                poster="/placeholder.svg?height=240&width=320"
                              >
                                Your browser does not support the video tag.
                              </video>
                            </div>
                            <div className="mt-2 flex items-center justify-between">
                              <span className="text-sm text-muted-foreground truncate max-w-[80%]">
                                {watch(`subParcours.${index}.video`)?.split("/").pop() || "Sub-parcours video"}
                              </span>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeSubParcoursVideo(index)}
                                className="text-xs"
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    appendSubParcours({
                      name: "",
                      numberOfWorkshops: 0,
                      durationEstimated: "",
                      tyroliennes: 0,
                      description: "",
                      images: [],
                      video: "",
                    })
                  }
                  className="w-full"
                  disabled={activityId && !editableFields.subParcours}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Sub-Parcours
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
              <CardDescription>Define features for this activity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {featureFields.map((field, index) => (
                <div key={field.id} className="rounded-lg border p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Feature {index + 1}</h3>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFeature(index)}
                      disabled={featureFields.length === 1 || (activityId && !editableFields.features)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={`feature-name-${index}`}>Name</Label>
                      <div className="relative">
                        <Input
                          id={`feature-name-${index}`}
                          {...register(`features.${index}.feature`)}
                          placeholder="Feature name"
                          disabled={activityId && !editableFields.features}
                        />
                        {activityId && (
                          <EditButton
                            size="sm"
                            variant="subtle"
                            tooltipText="Edit feature name"
                            onEdit={() => toggleEditable("features")}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2"
                          />
                        )}
                      </div>
                      {errors.features?.[index]?.feature && (
                        <p className="text-red-500 text-sm">{errors.features[index]?.feature?.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`feature-description-${index}`}>Description</Label>
                      <div className="relative">
                        <Textarea
                          id={`feature-description-${index}`}
                          {...register(`features.${index}.description`)}
                          placeholder="Feature description"
                          rows={3}
                          disabled={activityId && !editableFields.features}
                        />
                        {activityId && (
                          <EditButton
                            size="sm"
                            variant="subtle"
                            tooltipText="Edit description"
                            onEdit={() => toggleEditable("features")}
                            className="absolute right-2 top-2"
                          />
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`feature-available-${index}`}>Availability</Label>
                      <div className="relative">
                        <Controller
                          name={`features.${index}.available`}
                          control={control}
                          render={({ field }) => (
                            <Select
                              value={field.value ? "true" : "false"}
                              onValueChange={(value) => field.onChange(value === "true")}
                              disabled={activityId && !editableFields.features}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select availability" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="true">Available</SelectItem>
                                <SelectItem value="false">Not Available</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {activityId && (
                          <EditButton
                            size="sm"
                            variant="subtle"
                            tooltipText="Edit availability"
                            onEdit={() => toggleEditable("features")}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  appendFeature({
                    feature: "",
                    description: "",
                    available: true,
                  })
                }
                className="w-full"
                disabled={activityId && !editableFields.features}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Feature
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Activity Details</CardTitle>
              <CardDescription>Provide detailed information about the activity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="deroulement">Déroulement (Process)</Label>
                <div className="relative">
                  <Textarea
                    id="deroulement"
                    {...register("details.déroulement")}
                    placeholder="Describe the activity process"
                    rows={4}
                    disabled={activityId && !editableFields.details}
                  />
                  {activityId && (
                    <EditButton
                      size="sm"
                      variant="subtle"
                      tooltipText="Edit déroulement"
                      onEdit={() => toggleEditable("details")}
                      className="absolute right-2 top-2"
                    />
                  )}
                </div>
                {errors.details?.déroulement && (
                  <p className="text-red-500 text-sm">{errors.details.déroulement.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <div className="relative">
                  <Input
                    id="duration"
                    {...register("details.duration")}
                    placeholder="e.g., 2 hours"
                    disabled={activityId && !editableFields.details}
                  />
                  {activityId && (
                    <EditButton
                      size="sm"
                      variant="subtle"
                      tooltipText="Edit duration"
                      onEdit={() => toggleEditable("details")}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    />
                  )}
                </div>
                {errors.details?.duration && <p className="text-red-500 text-sm">{errors.details.duration.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Rules/Features</Label>
                {detailFeatureFields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2 mb-2">
                    <div className="relative flex-1">
                      <Input
                        {...register(`details.features.${index}`)}
                        placeholder="e.g., Safety harness required"
                        disabled={activityId && !editableFields.details}
                      />
                      {activityId && (
                        <EditButton
                          size="sm"
                          variant="subtle"
                          tooltipText="Edit rule/feature"
                          onEdit={() => toggleEditable("details")}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2"
                        />
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeDetailFeature(index)}
                      disabled={activityId && !editableFields.details}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => appendDetailFeature("")}
                  className="w-full"
                  disabled={activityId && !editableFields.details}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Rule/Feature
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {watchIsParcours && (
          <TabsContent value="difficulty">
            <Card>
              <CardHeader>
                <CardTitle>Difficulty Level</CardTitle>
                <CardDescription>Set the difficulty level for this parcours</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="difficulty-level">Difficulty Level</Label>
                  <div className="relative">
                    <Controller
                      name="difficulty.level"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={activityId && !editableFields.difficulty}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select difficulty level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {activityId && (
                      <EditButton
                        size="sm"
                        variant="subtle"
                        tooltipText="Edit difficulty level"
                        onEdit={() => toggleEditable("difficulty")}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      />
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty-description">Difficulty Description</Label>
                  <div className="relative">
                    <Textarea
                      id="difficulty-description"
                      {...register("difficulty.description")}
                      placeholder="Describe the difficulty level"
                      rows={3}
                      disabled={activityId && !editableFields.difficulty}
                    />
                    {activityId && (
                      <EditButton
                        size="sm"
                        variant="subtle"
                        tooltipText="Edit difficulty description"
                        onEdit={() => toggleEditable("difficulty")}
                        className="absolute right-2 top-2"
                      />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      <div className="mt-4 flex justify-end">
        <Button type="submit" disabled={isSubmitting || !watchHeaderImage}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {activityId ? "Updating..." : "Creating..."}
            </>
          ) : activityId ? (
            "Update Activity"
          ) : (
            "Create Activity"
          )}
        </Button>
      </div>
    </form>
  )
}
