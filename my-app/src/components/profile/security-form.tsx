"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "react-hot-toast"
import { Loader2 } from "lucide-react"
import AuthService from "../../services/auth-service"

const securityFormSchema = z
  .object({
    currentPassword: z.string().min(1, {
      message: "Current password is required.",
    }),
    newPassword: z.string().min(8, {
      message: "Password must be at least 8 characters.",
    }),
    confirmPassword: z.string().min(8, {
      message: "Password must be at least 8 characters.",
    }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
interface SecurityFormProps {
  user: {
    id: string
    name: string
    email: string
    role: string
    username?: string
    avatar?: string
  }
}
type SecurityFormValues = z.infer<typeof securityFormSchema>

export function SecurityForm({ user }: SecurityFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<SecurityFormValues>({
    resolver: zodResolver(securityFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(data: SecurityFormValues) {
    setIsSubmitting(true)
    try {
      // Get token from localStorage
      const token = localStorage.getItem("authToken")

      if (!token) {
        toast.error("You must be logged in to change your password")
        return
      }

      const response = await AuthService.changePassword(
        {
          oldPassword: data.currentPassword,
          newPassword: data.newPassword,
        },
        token,
      )

      if (response && response.success) {
        toast.success("Password changed successfully")
        form.reset()
      } else {
        toast.error(response?.message || "Failed to change password")
      }
    } catch (error: any) {
      console.error("Error changing password:", error)
      toast.error(error?.message || "An error occurred while changing your password")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormDescription>Password must be at least 8 characters long.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm New Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            "Change password"
          )}
        </Button>
      </form>
    </Form>
  )
}
