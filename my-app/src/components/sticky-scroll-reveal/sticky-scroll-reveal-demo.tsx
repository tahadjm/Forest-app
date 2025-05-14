"use client"
import { StickyScroll } from "./sticky-scroll-reveal"

const securityContent = [
  {
    title: "Equipment Inspection & Maintenance",
    description:
      "Daily checks on all personal protective equipment and annual third‐party inspections ensure every piece meets rigorous European safety standards.",
    text: "Inspection & Maintenance",
    image: "/image/image.jpg",
  },
  {
    title: "Safety Briefing & Test Course",
    description:
      "Mandatory safety briefings and a supervised test course guarantee that all participants understand and can correctly use the equipment before proceeding.",
    text: "Safety Briefing",
    image: "/image/laser.jpg",
  },
  {
    title: "Personal Protective Equipment (PPE)",
    description:
      "Trained operators fit and adjust PPE to ensure a secure and proper fit. Closed shoes, helmets, and gloves are required as needed.",
    text: "PPE",
    image: "/image/arc.jpeg",
  },
  {
    title: "Continuous Lifeline & Fall Arrest",
    description:
      "A continuous lifeline system with an automatic locking carabiner ensures participants remain securely attached throughout the course.",
    text: "Lifeline System",
    image: "/image/laser.jpg",
  },
  {
    title: "Operational Guidelines",
    description:
      "Clear criteria for course access, behavior, and platform capacity—displayed via prominent signage—help maintain a safe environment.",
    text: "Operational Rules",
    image: "/image/accrobranche.jpeg",
  },
  {
    title: "Emergency Preparedness",
    description:
      "Well-established emergency protocols and regular staff training ensure a swift rescue response in the event of an incident.",
    text: "Emergency Response",
    image: "/image/image.jpg",
  },
  {
    title: "Course Design & Environmental Integration",
    description:
      "Courses are designed to integrate seamlessly with the natural environment, ensuring structural integrity while preserving tree health.",
    text: "Course Design",
    image: "/image/image.jpg",
  },
]

export function StickyScrollRevealDemo() {
  return (
    <div className="p-10">
      <StickyScroll content={securityContent} />
    </div>
  )
}
