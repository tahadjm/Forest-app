import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/context/auth-context"
import { AuthModal } from "@/components/auth/auth-modal"
import { Toaster } from "react-hot-toast"
import { CartUpdateProvider } from "@/components/providers/cart-update-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Adventure Park",
  description: "Book your adventure today",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <AuthModal />
          <CartUpdateProvider />
          <Toaster position="top-center" />
        </AuthProvider>
      </body>
    </html>
  )
}
