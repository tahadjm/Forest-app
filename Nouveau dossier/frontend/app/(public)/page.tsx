"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useAuthModal } from "@/hooks/use-auth-modal"
import { AboutSection } from "@/components/AboutUs/AboutUs"
import { Parks } from "@/components/Parks/Parks"
import { FaqSection } from "@/components/FaqSection/FaqSection"
import { NewsSection } from "@/components/news/news-section"
import { HeroSection } from "@/components/ui/hero-section"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { TimelineDemo } from "@/components/TimeLine/TimelineDemo"
import SecuritySchema from "@/components/security-schema"
export default function HomePage() {
  const searchParams = useSearchParams()
  const { onOpen, setView } = useAuthModal()

  // Check for auth parameters in URL and open auth modal if needed
  useEffect(() => {
    const authParam = searchParams?.get("auth")
    const callbackUrl = searchParams?.get("callbackUrl")

    if (authParam === "login" || authParam === "signup") {
      // Store callback URL in localStorage for post-login redirection
      if (callbackUrl) {
        localStorage.setItem("authCallbackUrl", callbackUrl)
      }

      // Open auth modal with the specified view
      setView(authParam as any)
      onOpen()
    }
  }, [searchParams, onOpen, setView])

  return (
    <main>
      <HeroSection
        title="Discover Adventure Parks"
        description="Experience thrilling outdoor activities and create unforgettable memories with family and friends."
        videoSrc="http://localhost:8000/uploads/clip.mp4"
        height="large"
      >
        <div className="flex flex-wrap gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/park">
              Explore Parks <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="bg-background/20 backdrop-blur-sm hover:bg-background/30">
            Learn More
          </Button>
        </div>
      </HeroSection>

      <Parks />
      <TimelineDemo />
      {/* <Parcours /> */}
      <AboutSection />
      <SecuritySchema />
      <FaqSection />
      <NewsSection />
    </main>
  )
}
