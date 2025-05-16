"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AuthService, type User } from "@/services/auth-service"
import { toast } from "react-hot-toast"
import { Check, Loader2, Pencil, X } from "lucide-react"

const profileFormSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  role: z.enum(["admin", "user", "sous-admin"]),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>
type FieldName = keyof ProfileFormValues

interface ProfileFormProps {
  user: User
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingFields, setEditingFields] = useState<Record<FieldName, boolean>>({
    username: false,
    email: false,
    role: false,
  })

  // Make sure form is initialized with valid values
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: "",
      email: "",
      role: "user",
    },
    mode: "onChange",
  })

  useEffect(() => {
    if (user) {
      form.reset({
        username: user.username || "",
        email: user.email || "",
        role: (user.role as "admin" | "user" | "sous-admin") || "user",
      })
    }
  }, [user, form])

  const toggleFieldEdit = (fieldName: FieldName) => {
    if (editingFields[fieldName]) {
      // If canceling edit, reset the field to original value
      form.setValue(fieldName, user[fieldName] as string)
    }

    setEditingFields((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }))
  }

  async function onSubmit(data: ProfileFormValues) {
    setIsSubmitting(true)
    try {
      const response = await AuthService.updateUser(user.id, data.email, data.username, data.role)
      if (response && response.success) {
        toast.success("Profile updated successfully")
        // Reset all editing states
        setEditingFields({
          username: false,
          email: false,
          role: false,
        })
      } else {
        toast.error("Failed to update profile")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("An error occurred while updating your profile")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function updateSingleField(fieldName: FieldName) {
    const value = form.getValues(fieldName)
    setIsSubmitting(true)

    try {
      // Create an update object with just the field being updated
      const updateData = {
        id: user.id,
        [fieldName]: value,
      }

      // Call a modified version of updateUser that accepts partial updates
      const response = await AuthService.updateUserField(user.id, fieldName, value)

      if (response && response.success) {
        toast.success(`${fieldName} updated successfully`)
        toggleFieldEdit(fieldName)
      } else {
        toast.error(`Failed to update ${fieldName}`)
      }
    } catch (error) {
      console.error(`Error updating ${fieldName}:`, error)
      toast.error(`An error occurred while updating your ${fieldName}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Username</FormLabel>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleFieldEdit("username")}
                  className="h-6 w-6 rounded-full"
                >
                  {editingFields.username ? <X className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
                  <span className="sr-only">
                    {editingFields.username ? "Cancel editing username" : "Edit username"}
                  </span>
                </Button>
              </div>
              <FormControl>
                <Input
                  placeholder="Your username"
                  {...field}
                  readOnly={!editingFields.username}
                  className={!editingFields.username ? "bg-muted cursor-default" : ""}
                />
              </FormControl>
              <FormDescription>This is your public display name.</FormDescription>
              <FormMessage />
              {editingFields.username && (
                <div className="flex justify-end gap-2 mt-2">
                  <Button type="button" size="sm" onClick={() => updateSingleField("username")} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Check className="h-3.5 w-3.5 mr-1" />
                    )}
                    Save
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => toggleFieldEdit("username")}>
                    Cancel
                  </Button>
                </div>
              )}
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Email</FormLabel>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleFieldEdit("email")}
                  className="h-6 w-6 rounded-full"
                >
                  {editingFields.email ? <X className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
                  <span className="sr-only">{editingFields.email ? "Cancel editing email" : "Edit email"}</span>
                </Button>
              </div>
              <FormControl>
                <Input
                  placeholder="Your email address"
                  {...field}
                  readOnly={!editingFields.email}
                  className={!editingFields.email ? "bg-muted cursor-default" : ""}
                />
              </FormControl>
              <FormDescription>We'll use this email to contact you about your reservations.</FormDescription>
              <FormMessage />
              {editingFields.email && (
                <div className="flex justify-end gap-2 mt-2">
                  <Button type="button" size="sm" onClick={() => updateSingleField("email")} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Check className="h-3.5 w-3.5 mr-1" />
                    )}
                    Save
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => toggleFieldEdit("email")}>
                    Cancel
                  </Button>
                </div>
              )}
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Role</FormLabel>
                {/* No edit button for role since it's always read-only */}
              </div>
              <FormControl>
                <Select disabled={true} onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger className="bg-muted cursor-default">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="sous-admin">Sous Admin</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>Your account role determines your permissions.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}
