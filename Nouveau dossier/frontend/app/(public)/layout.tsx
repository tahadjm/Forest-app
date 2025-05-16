import type React from "react"
import { Poppins } from "next/font/google"
import "./globals.css"

import Footer from "@/components/Footer/Footer"
import { MainNav } from "@/components/Header/Header"
import Modal from "@/components/Modal/Modal"
import { Providers } from "./providers"
import { Toaster } from "react-hot-toast"
import { AuthModal } from "@/components/auth/auth-modal"
import { CartPanel } from "@/components/cart-panel"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  style: ["italic", "normal"],
  variable: "--font-poppins",
})

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={`${poppins.className} min-h-screen flex flex-col`}>
      <Providers>
        <div className="flex flex-col min-h-screen">
          <MainNav />
          <main className="flex-grow pt-16">{children}</main>
          <Footer />
        </div>
        <Modal />
        <AuthModal />
        <CartPanel />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: "hsl(var(--background))",
              color: "hsl(var(--foreground))",
              border: "1px solid hsl(var(--border))",
            },
          }}
        />
      </Providers>
    </div>
  )
}
