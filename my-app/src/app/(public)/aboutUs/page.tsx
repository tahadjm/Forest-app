import { AboutSection } from "@/components/AboutUs/AboutUs"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About Us | Adventure Park",
  description: "Learn about our story, mission, values, and the team behind Adventure Park.",
}

export default function AboutUsPage() {
  return <AboutSection />
}
