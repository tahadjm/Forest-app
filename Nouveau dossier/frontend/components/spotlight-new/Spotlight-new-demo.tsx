"use client"
import type React from "react"
import { Spotlight } from "./spotlight-new"

interface SpotlightNewDemoProps {
  background?: string // Video or Image URL - now optional
  children: React.ReactNode // Content inside the section
  height?: string // Optional height prop (default: "40rem")
}

export function SpotlightNewDemo({
  background = "/placeholder.svg",
  children,
  height = "40rem",
}: SpotlightNewDemoProps) {
  return (
    <div
      className={`w-full rounded-md flex md:items-center md:justify-center bg-black/[0.96] antialiased bg-grid-white/[0.02] relative overflow-hidden`}
      style={{ height }} // Apply dynamic height
    >
      {/* Background (Video or Image) */}
      {background && background.endsWith(".mp4") ? (
        <video autoPlay loop muted playsInline className="absolute top-0 left-0 w-full h-full object-cover z-0">
          <source src={background} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ) : background ? (
        <img
          src={background || "/placeholder.svg"}
          alt="Background"
          className="absolute top-0 left-0 w-full h-full object-cover z-0"
        />
      ) : null}

      {/* Spotlight Effect */}
      <Spotlight />

      {/* Content */}
      <div className="p-4 max-w-7xl mx-auto relative z-10 w-full flex flex-col items-center justify-center h-full text-center">
        {children}
      </div>
    </div>
  )
}
