"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useAuthModal } from "@/hooks/use-auth-modal"
import { useAuth } from "@/context/auth-context"
import { toast } from "react-hot-toast"
import { Loader2 } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { FaGoogle, FaGithub } from "react-icons/fa"
import { useRouter } from "next/navigation"

// API URL with fallback
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
})

type FormValues = z.infer<typeof formSchema>

export const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const { onClose, setView } = useAuthModal()
  const { login } = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  // Check the URL for a token and redirect if found (for OAuth callbacks)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search)
      const token = urlParams.get("token")
      if (token) {
        localStorage.setItem("token", token)
        onClose()
        // No need to force a page refresh - the auth context will handle the state update
      }
    }
  }, [onClose])

  const onSubmit = async (values: FormValues) => {
    if (isLoading) return

    setIsLoading(true)
    setErrorMessage("")

    try {
      console.log("Attempting login with:", { email: values.email })
      const success = await login(values.email, values.password)
      if (success) {
        toast.success("Login successful!")
        onClose()

        // Check if there's a callback URL to redirect to
        const callbackUrl = searchParams?.get("callbackUrl")
        if (callbackUrl) {
          router.push(callbackUrl)
        }
        router.refresh()
      } else {
        setErrorMessage("Invalid email or password")
      }
    } catch (error: any) {
      console.error("Login error:", error)
      if (error.response?.data?.message) {
        setErrorMessage(error.response.data.message)
      } else {
        setErrorMessage("Failed to login. Please check your credentials.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Redirect user to the backend for OAuth
  const handleGoogleSignIn = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google` || "http://localhost:8000/api/auth/google"
  }

  const handleGithubSignIn = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/github` || "http://localhost:8000/api/auth/github"
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Enter your email" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="********" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {errorMessage && (
          <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {errorMessage}
          </div>
        )}

        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="link"
            className="px-0 font-normal"
            onClick={() => setView("forgotPassword")}
            disabled={isLoading}
          >
            Forgot password?
          </Button>
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Logging in...
            </>
          ) : (
            "Login"
          )}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button type="button" variant="outline" onClick={handleGoogleSignIn} disabled={isLoading}>
            <FaGoogle className="mr-2 h-4 w-4" />
            Google
          </Button>
          <Button type="button" variant="outline" onClick={handleGithubSignIn} disabled={isLoading}>
            <FaGithub className="mr-2 h-4 w-4" />
            GitHub
          </Button>
        </div>
      </form>
      <div className="mt-4 text-center text-sm">
        Don&apos;t have an account?{" "}
        <Button
          type="button"
          variant="link"
          className="p-0 font-normal"
          onClick={() => setView("signup")}
          disabled={isLoading}
        >
          Sign up
        </Button>
      </div>
    </Form>
  )
}
