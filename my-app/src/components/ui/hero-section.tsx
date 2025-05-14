"use client"

import type React from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

type HeroSectionProps = {
  title: string
  description?: string
  children?: React.ReactNode
  videoSrc?: string
  backgroundOverlay?: boolean
  height?: "small" | "medium" | "large" | "custom"
  className?: string
  align?: "left" | "center" | "right"
}

export function HeroSection({
  title,
  description,
  children,
  videoSrc,
  backgroundOverlay = true,
  height = "medium",
  className,
  align = "center",
}: HeroSectionProps) {
  console.log("Hero Section Video Source:", videoSrc)
  // Height classes based on the height prop
  const heightClasses = {
    small: "py-12 md:py-16",
    medium: "py-16 md:py-24",
    large: "py-20 md:py-32 lg:py-40",
    custom: "", // No default classes for custom height
  }

  // Alignment classes
  const alignClasses = {
    left: "text-left items-start",
    center: "text-center items-center",
    right: "text-right items-end",
  }

  return (
    <section className={cn("relative w-full overflow-hidden", heightClasses[height], className)}>
      {/* Video Background */}
      {videoSrc ? (
        <div className="absolute inset-0 w-full h-full">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            src={videoSrc}
            crossOrigin="anonymous"
          >
            Your browser does not support the video tag.
          </video>
          {backgroundOverlay && <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />}
        </div>
      ) : (
        // Fallback background if no video
        <div className="absolute inset-0 bg-gradient-to-b from-muted/80 to-muted">
          {backgroundOverlay && <div className="absolute inset-0 bg-black/30" />}
        </div>
      )}

      {/* Content */}
      <div className="container relative z-10 h-full flex flex-col justify-center">
        <div className={cn("max-w-3xl mx-auto flex flex-col gap-4", alignClasses[align])}>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={cn(
              "text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl",
              videoSrc && "text-white",
            )}
          >
            {title}
          </motion.h1>

          {description && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className={cn("text-lg md:text-xl", videoSrc ? "text-white/80" : "text-muted-foreground")}
            >
              {description}
            </motion.p>
          )}

          {children && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-2"
            >
              {children}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}
