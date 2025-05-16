"use client"

import { CardFooter } from "@/components/ui/card"
import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Save, Loader2, RotateCcw, AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AuthService } from "@/services/auth-service"
import { ParkService } from "@/services/park-service"
import { showToast } from "../Toast/Toast"
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

// Enhanced validation schema
const userFormSchema = z.object({
  username: z
    .string()
    .min(5, "Username must be at least 5 characters")
    .max(50, "Username cannot exceed 50 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores and hyphens"),
  email: z.string().email("Please enter a valid email address").max(100, "Email cannot exceed 100 characters"),
  role: z.enum(["user", "sous admin", "admin"], {
    required_error: "Please select a user role",
  }),
  parkId: z.string().optional(),
})

type UserFormValues = z.infer<typeof userFormSchema>

interface UserFormProps {
  userId?: string
}

export function UserForm({ userId }: UserFormProps) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [parks, setParks] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [originalValues, setOriginalValues] = useState<UserFormValues | null>(null)
  const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null)

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: "",
      email: "",
      role: "user",
      parkId: "",
    },
    mode: "onChange", // Validate on change for better UX
  })

  // Get form state for dirty checking
  const { isDirty, dirtyFields } = form.formState

  // Function to check if a specific field has changed
  const hasFieldChanged = (fieldName: keyof UserFormValues): boolean => {
    return !!dirtyFields[fieldName] && originalValues !== null
  }

  // Fetch user data if editing an existing user
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return
      setIsLoading(true)
      try {
        console.log("Fetching user data for user ID:", userId)
        const response = await AuthService.getUsers(userId)
        console.log("User data:", response)
        if (response.data && response.data.length > 0) {
          const userData = response.data[0]
          setUser(userData)
          const formValues = {
            username: userData.username || "",
            email: userData.email || "",
            role: userData.role || "user",
            parkId: userData.parkId || "",
          }
          form.reset(formValues)
          setOriginalValues(formValues) // Store original values for comparison
        } else {
          setError("User not found")
        }
      } catch (error) {
        console.error("Error fetching user:", error)
        setError("Failed to load user data")
      } finally {
        setIsLoading(false)
      }
    }

    // Fetch parks using getParkForCurrentUser
    const fetchParks = async () => {
      try {
        const response = await ParkService.getParkForCurrentUser()
        // Ensure response.data is always an array.
        const parkData = Array.isArray(response.data) ? response.data : response.data ? [response.data] : []
        setParks(parkData)
      } catch (error) {
        console.error("Error fetching parks:", error)
      }
    }

    fetchUserData()
    fetchParks()
  }, [userId, form])

  // Warn before unload if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = "You have unsaved changes. Are you sure you want to leave?"
        return e.returnValue
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [isDirty])

  // Handle navigation with unsaved changes
  const handleNavigation = (path: string) => {
    if (isDirty) {
      setPendingNavigation(path)
      setShowUnsavedChangesDialog(true)
    } else {
      router.push(path)
    }
  }

  // Memoize park options to avoid unnecessary re-renders
  const parkOptions = useMemo(() => {
    return parks.map((park) => (
      <SelectItem key={park._id} value={park._id}>
        {park.name}
      </SelectItem>
    ))
  }, [parks])

  const onSubmit = async (data: UserFormValues) => {
    setIsLoading(true)
    try {
      // If role is not "sous admin", remove parkId
      if (data.role !== "sous admin") {
        data.parkId = undefined
      }

      // Only proceed if we have a userId (editing an existing user)
      if (userId && originalValues) {
        // Track what has changed
        const changedFields: Partial<UserFormValues> = {}
        let hasChanges = false
        const updatePromises = []

        // Check which fields have changed
        if (data.username !== originalValues.username) {
          changedFields.username = data.username
          hasChanges = true
          updatePromises.push(
            AuthService.updateUserField(userId, "username", data.username).catch((error) => {
              console.error("Error updating username:", error)
              throw new Error(`Failed to update username: ${error.message || "Unknown error"}`)
            }),
          )
        }

        if (data.email !== originalValues.email) {
          changedFields.email = data.email
          hasChanges = true
          updatePromises.push(
            AuthService.updateUserField(userId, "email", data.email).catch((error) => {
              console.error("Error updating email:", error)
              throw new Error(`Failed to update email: ${error.message || "Unknown error"}`)
            }),
          )
        }

        // Handle role changes
        if (data.role !== originalValues.role) {
          changedFields.role = data.role
          hasChanges = true

          try {
            if (data.role === "sous admin") {
              // Set user to sous admin with park assignment
              await AuthService.setRole(userId, "sous admin", data.parkId)
            } else {
              // Set to user or admin role
              await AuthService.setRole(userId, data.role)
            }
          } catch (error: any) {
            console.error("Error updating user role:", error)
            showToast(error.message || "Failed to update user role", "error")
            throw error // Re-throw to prevent further processing
          }
        } else if (data.role === "sous admin" && data.parkId !== originalValues.parkId) {
          // If role is still sous admin but park assignment changed
          changedFields.parkId = data.parkId
          hasChanges = true

          try {
            await AuthService.setRole(userId, "sous admin", data.parkId)
          } catch (error: any) {
            console.error("Error updating park assignment:", error)
            showToast(error.message || "Failed to update park assignment", "error")
            throw error // Re-throw to prevent further processing
          }
        }

        // Process all update promises
        if (updatePromises.length > 0) {
          try {
            await Promise.all(updatePromises)
          } catch (error: any) {
            console.error("Error updating user fields:", error)
            showToast(error.message || "Failed to update some user information", "error")
            throw error
          }
        }

        // If we got here, everything succeeded
        if (hasChanges) {
          showToast("User updated successfully", "success")
          // Update original values to reflect the new state
          setOriginalValues(data)
          form.reset(data) // Reset form state to mark as pristine
          router.push("/dashboard/users")
          router.refresh()
        } else {
          showToast("No changes detected", "info")
        }
      }
    } catch (error: any) {
      console.error("Error saving user:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save user information",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Watch the role field to conditionally show the parkId field
  const watchRole = form.watch("role")
  const showParkField = watchRole === "sous admin"

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (isLoading && !user) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </div>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{userId ? "Edit User" : "Create User"}</CardTitle>
          <CardDescription>
            {userId ? "Update user information and permissions" : "Add a new user to your adventure park system"}
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              {isDirty && (
                <Alert className="bg-amber-50 border-amber-200">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <AlertTitle className="text-amber-800">Unsaved Changes</AlertTitle>
                  <AlertDescription className="text-amber-700">
                    You have unsaved changes. Click Save Changes to apply them.
                  </AlertDescription>
                </Alert>
              )}

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem className={hasFieldChanged("username") ? "border-l-2 border-blue-500 pl-2" : ""}>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="username" {...field} aria-label="Username" />
                    </FormControl>
                    <FormDescription>Username must be at least 5 characters long.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className={hasFieldChanged("email") ? "border-l-2 border-blue-500 pl-2" : ""}>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="email@example.com" type="email" {...field} aria-label="Email address" />
                    </FormControl>
                    <FormDescription>User's email address for login and notifications.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem className={hasFieldChanged("role") ? "border-l-2 border-blue-500 pl-2" : ""}>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger aria-label="Select user role">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="user">Regular User</SelectItem>
                        <SelectItem value="sous admin">Manager (Sous Admin)</SelectItem>
                        <SelectItem value="admin">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>The role determines what permissions the user has in the system.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {showParkField && (
                <FormField
                  control={form.control}
                  name="parkId"
                  render={({ field }) => (
                    <FormItem className={hasFieldChanged("parkId") ? "border-l-2 border-blue-500 pl-2" : ""}>
                      <FormLabel>Assigned Park</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl>
                          <SelectTrigger aria-label="Select assigned park">
                            <SelectValue placeholder="Select a park" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {parks.length > 0 ? (
                            parkOptions
                          ) : (
                            <div className="px-2 py-1.5 text-sm text-muted-foreground">No parks available</div>
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>Managers (Sous Admin) must be assigned to a specific park.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <div>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => handleNavigation("/dashboard/users")}
                  className="mr-2"
                  aria-label="Cancel and return to users list"
                >
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    if (originalValues) {
                      form.reset(originalValues)
                      showToast("Form reset to original values", "info")
                    }
                  }}
                  disabled={!isDirty}
                  aria-label="Reset form to original values"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              </div>
              <Button
                type="submit"
                disabled={isLoading || !isDirty}
                aria-label={isLoading ? "Saving user information" : "Save changes"}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {/* Unsaved changes dialog */}
      <AlertDialog open={showUnsavedChangesDialog} onOpenChange={setShowUnsavedChangesDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to leave this page? Your changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingNavigation) {
                  router.push(pendingNavigation)
                }
              }}
              className="bg-red-500 hover:bg-red-600"
            >
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
