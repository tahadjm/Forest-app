"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import LoadingButton from "../LoadingButton/LoadingButton"
import { FileUploader } from "react-drag-drop-files"
import { uploadMedia, deleteFile } from "@/utils/uploadImage"
import { PricingService } from "@/services/pricing-service"
import { ParkService } from "../../services/park-service"
import { ActivityService } from "@/services"
import { EditButton } from "@/components/ui/edit-button"

const pricingSchema = z.object({
  parkId: z.string().min(1, "Park is required"),
  name: z.string().min(1, "Name is required"),
  description: z.string().min(10, "Description must be at least 10 characters long"),
  image: z.string().url("Invalid URL").optional(),
  price: z.number().positive("Price must be positive"),
  additionalCharge: z.number().min(0, "Additional charge cannot be negative"),
  relatedIds: z.array(z.string()).min(1, "At least one related item is required"),
})

type PricingFormValues = z.infer<typeof pricingSchema>

interface PricingFormProps {
  pricingId?: string
  parkId?: string
}

export function PricingForm({ pricingId: propPricingId, parkId: propParkId }: PricingFormProps) {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()

  // Get pricingId from props or URL params
  const pricingId = propPricingId || (params?.id as string)

  // Get parkId from props, URL params, or query params
  const parkIdFromParams = params?.parkId as string
  const parkIdFromQuery = searchParams?.get("parkId")
  const parkId = propParkId || parkIdFromParams || parkIdFromQuery || ""

  console.log("Using pricingId:", pricingId)
  console.log("Using parkId:", parkId)

  // In edit mode, fields start read-only; in create mode, all fields are editable
  const isEditMode = !!pricingId

  // Initialize editable fields state
  const initialEditableState = {
    parkId: false,
    name: false,
    description: false,
    image: false,
    price: false,
    additionalCharge: false,
    relatedIds: false,
  }

  const [editableFields, setEditableFields] = useState(initialEditableState)
  const [isLoading, setIsLoading] = useState(isEditMode)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [parks, setParks] = useState<{ id: string; name: string }[]>([])
  const [relatedItems, setRelatedItems] = useState<{ id: string; name: string }[]>([])
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    getValues,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PricingFormValues>({
    resolver: zodResolver(pricingSchema),
    defaultValues: {
      parkId: parkId || "",
      name: "",
      description: "",
      image: "",
      price: 0,
      additionalCharge: 0,
      relatedIds: [],
    },
  })

  const selectedParkId = watch("parkId")
  const selectedRelatedIds = watch("relatedIds")

  useEffect(() => {
    const fetchParks = async () => {
      try {
        const response = await ParkService.getParkForCurrentUser()
        if (response?.data && Array.isArray(response.data)) {
          setParks(
            response.data.map((park: any) => ({
              id: park._id,
              name: park.name,
            })),
          )
        } else if (response?.data) {
          setParks([
            {
              id: response.data._id,
              name: response.data.name,
            },
          ])
        }
      } catch (error) {
        console.error("Error fetching parks:", error)
        toast({
          title: "Error",
          description: "Failed to load parks",
          variant: "destructive",
        })
      }
    }

    fetchParks()
  }, [])

  useEffect(() => {
    const fetchRelatedItems = async () => {
      if (!selectedParkId) return

      setIsLoading(true)
      try {
        const response = await ActivityService.getActivitiesByParkId(selectedParkId)
        const items = response.data

        if (!Array.isArray(items)) {
          console.error("Retrieved items is not an array:", items)
          setRelatedItems([])
          return
        }
        console.log("response is :", items)

        setRelatedItems(
          items.map((item: any) => ({
            id: item._id,
            name: item.name,
          })),
        )
      } catch (error) {
        console.error(`Error fetching activities:`, error)
        toast({
          title: "Error",
          description: `Failed to load activities`,
          variant: "destructive",
        })
        setRelatedItems([])
      } finally {
        setIsLoading(false)
      }
      console.log("relatedItems is", relatedItems)
    }

    fetchRelatedItems()
  }, [selectedParkId])

  useEffect(() => {
    if (pricingId) {
      const fetchPricingData = async () => {
        setIsLoading(true)
        try {
          console.log("Fetching pricing data for ID:", pricingId, "with parkId:", parkId)

          // Make sure we're passing the correct parameters to the service
          let data
          if (parkId) {
            data = await PricingService.getPricingById(pricingId, parkId)
            console.log("data is", data)
          }
          console.log("Received pricing data:", data)

          // Check if data is in the expected format
          if (!data) {
            throw new Error("No data received from API")
          }

          // If data is wrapped in a response object, extract it
          const pricingData = data.pricing || data

          console.log("Processed pricing data for form:", pricingData)

          // Reset the form with the data
          reset({
            parkId: pricingData.parkId || parkId || "",
            name: pricingData.name || "",
            description: pricingData.description || "",
            image: pricingData.image || "",
            price: pricingData.price || 0,
            additionalCharge: pricingData.additionalCharge || 0,
            relatedIds: pricingData.relatedIds || [],
          })
        } catch (error) {
          console.error("Error fetching pricing data:", error)
          setLoadError("Failed to load pricing data. Please try again.")
          toast({
            title: "Error",
            description: "Failed to load pricing data",
            variant: "destructive",
          })
        } finally {
          setIsLoading(false)
        }
      }

      fetchPricingData()
    }
  }, [pricingId, parkId, reset])

  // Handle file upload
  const handleFileChange = async (file: File) => {
    setIsUploadingImage(true)
    try {
      const imageUrl = await uploadMedia(file)
      if (imageUrl) {
        // Set value and trigger validation immediately
        setValue("image", imageUrl, { shouldValidate: true })
        toast({
          title: "Success",
          description: "Image uploaded successfully",
        })
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      toast({
        title: "Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploadingImage(false)
    }
  }

  // Handle image removal
  const handleImageRemove = () => {
    if (isEditMode) {
      toast({
        title: "Warning",
        description: "You must upload a new image before updating",
        variant: "destructive",
      })
    }
    const imageUrl = watch("image")
    if (imageUrl) {
      const filename = imageUrl.split("/").pop()
      if (filename) {
        deleteFile(filename)
      }
    }
    setValue("image", "", { shouldValidate: true })
  }

  const onSubmit = async (data: PricingFormValues) => {
    // Prevent submission if image is uploading
    if (isUploadingImage) {
      toast({
        title: "Please wait",
        description: "Please wait until the image upload is complete.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      if (pricingId) {
        await PricingService.updateProduct(data.parkId, pricingId, data)
        toast({
          title: "Success",
          description: "Pricing updated successfully",
        })
      } else {
        await PricingService.addPricing(data.parkId, data)
        toast({
          title: "Success",
          description: "New pricing created successfully",
        })
      }
      router.push("/dashboard/pricing")
    } catch (error) {
      console.error("Error saving pricing:", error)
      toast({
        title: "Error",
        description: "Failed to save pricing",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCheckboxChange = (itemId: string, checked: boolean) => {
    const currentRelatedIds = getValues("relatedIds") || []
    let newRelatedIds: string[]

    if (checked) {
      // Add the ID if it's checked and not already in the array
      newRelatedIds = [...currentRelatedIds, itemId]
    } else {
      // Remove the ID if it's unchecked
      newRelatedIds = currentRelatedIds.filter((id) => id !== itemId)
    }

    setValue("relatedIds", newRelatedIds, { shouldValidate: true })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading pricing data...</span>
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
      <Card>
        <CardHeader>
          <CardTitle>{isEditMode ? "Edit Pricing" : "Create New Pricing"}</CardTitle>
          <CardDescription>Enter the details for the pricing entry.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="parkId">Park</Label>
            <div className="relative">
              <Controller
                name="parkId"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isEditMode ? !editableFields.parkId : false}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a park" />
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
              {isEditMode && (
                <EditButton
                  size="sm"
                  variant="subtle"
                  tooltipContent="Edit park"
                  onEdit={() => setEditableFields((prev) => ({ ...prev, parkId: !prev.parkId }))}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                />
              )}
            </div>
            {errors.parkId && <p className="text-red-500 text-sm">{errors.parkId.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <div className="relative">
              <Input id="name" {...register("name")} disabled={isEditMode ? !editableFields.name : false} />
              {isEditMode && (
                <EditButton
                  size="sm"
                  variant="subtle"
                  tooltipContent="Edit name"
                  onEdit={() => setEditableFields((prev) => ({ ...prev, name: !prev.name }))}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                />
              )}
            </div>
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <div className="relative">
              <Textarea
                id="description"
                {...register("description")}
                disabled={isEditMode ? !editableFields.description : false}
              />
              {isEditMode && (
                <EditButton
                  size="sm"
                  variant="subtle"
                  tooltipContent="Edit description"
                  onEdit={() => setEditableFields((prev) => ({ ...prev, description: !prev.description }))}
                  className="absolute right-2 top-2"
                />
              )}
            </div>
            {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Image</Label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 transition-all hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <FileUploader handleChange={handleFileChange} name="file" types={["JPG", "PNG", "GIF", "MP4"]}>
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
            {errors.image && <p className="text-red-500 text-sm">{errors.image.message}</p>}

            {/* Preview uploaded image if available */}
            {watch("image") && (
              <div className="mt-4 relative group">
                <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
                  <img
                    src={watch("image") || "/placeholder.svg"}
                    alt="Uploaded Image"
                    className="h-48 w-full object-cover transition-transform group-hover:scale-105"
                    crossOrigin="anonymous"
                  />
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground truncate max-w-[80%]">
                    {watch("image").split("/").pop() || "Uploaded image"}
                  </span>
                  <Button type="button" variant="outline" size="sm" onClick={handleImageRemove} className="text-xs">
                    Remove
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <div className="relative">
              <Input
                id="price"
                type="number"
                step="0.01"
                {...register("price", { valueAsNumber: true })}
                disabled={isEditMode ? !editableFields.price : false}
              />
              {isEditMode && (
                <EditButton
                  size="sm"
                  variant="subtle"
                  tooltipContent="Edit price"
                  onEdit={() => setEditableFields((prev) => ({ ...prev, price: !prev.price }))}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                />
              )}
            </div>
            {errors.price && <p className="text-red-500 text-sm">{errors.price.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="additionalCharge">Additional Charge</Label>
            <div className="relative">
              <Input
                id="additionalCharge"
                type="number"
                step="0.01"
                {...register("additionalCharge", { valueAsNumber: true })}
                disabled={isEditMode ? !editableFields.additionalCharge : false}
              />
              {isEditMode && (
                <EditButton
                  size="sm"
                  variant="subtle"
                  tooltipContent="Edit additional charge"
                  onEdit={() => setEditableFields((prev) => ({ ...prev, additionalCharge: !prev.additionalCharge }))}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                />
              )}
            </div>
            {errors.additionalCharge && <p className="text-red-500 text-sm">{errors.additionalCharge.message}</p>}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Related Activities</Label>
              {isEditMode && (
                <EditButton
                  size="sm"
                  variant="subtle"
                  tooltipContent="Edit related activities"
                  onEdit={() => setEditableFields((prev) => ({ ...prev, relatedIds: !prev.relatedIds }))}
                  className="cursor-pointer"
                />
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
              {relatedItems.length > 0 ? (
                relatedItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`related-${item.id}`}
                      checked={selectedRelatedIds?.includes(item.id)}
                      onCheckedChange={(checked) => handleCheckboxChange(item.id, checked as boolean)}
                      disabled={isEditMode ? !editableFields.relatedIds : false}
                    />
                    <Label htmlFor={`related-${item.id}`} className="cursor-pointer">
                      {item.name}
                    </Label>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">
                  {selectedParkId
                    ? `No Activities s available for the selected park`
                    : `Please select a park to view available Activities`}
                </p>
              )}
            </div>
            {errors.relatedIds && <p className="text-red-500 text-sm">{errors.relatedIds.message}</p>}
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex justify-end">
        {isSubmitting || isUploadingImage ? (
          <LoadingButton
            text={isEditMode ? "Updating..." : "Saving..."}
            className="text-white bg-blue-500 px-4 py-2 rounded-md"
          />
        ) : (
          <Button type="submit" disabled={isLoading}>
            {isEditMode ? "Update Pricing" : "Create Pricing"}
          </Button>
        )}
      </div>
    </form>
  )
}
