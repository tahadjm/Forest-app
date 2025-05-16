"use client"
import React, { useEffect, useRef, useState } from "react"
import { useMotionValueEvent, useScroll } from "framer-motion"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import Image from "next/image"

// This is a debug version that will help identify the issue
export const DebugStickyScroll = ({
  content,
  contentClassName,
}: {
  content: {
    title: string
    description: string
    content?: React.ReactNode | any
    image?: string
    text?: string
  }[]
  contentClassName?: string
}) => {
  const [activeCard, setActiveCard] = React.useState(0)
  const [debug, setDebug] = useState<{ [key: string]: any }>({})
  const ref = useRef<any>(null)
  const { scrollYProgress } = useScroll({
    container: ref,
    offset: ["start start", "end start"],
  })
  const cardLength = content.length

  // Log debug info
  useEffect(() => {
    const imageInfo = content.map((item, i) => ({
      index: i,
      title: item.title,
      hasImage: !!item.image,
      imagePath: item.image || "none",
    }))

    setDebug((prev) => ({
      ...prev,
      contentLength: content.length,
      imageInfo,
      activeCard,
    }))

    console.log("Debug Info:", {
      activeCard,
      currentImagePath: content[activeCard]?.image || "none",
      allImages: imageInfo,
    })
  }, [activeCard, content])

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const cardsBreakpoints = content.map((_, index) => index / cardLength)
    const closestBreakpointIndex = cardsBreakpoints.reduce((acc, breakpoint, index) => {
      const distance = Math.abs(latest - breakpoint)
      if (distance < Math.abs(latest - cardsBreakpoints[acc])) {
        return index
      }
      return acc
    }, 0)
    setActiveCard(closestBreakpointIndex)
  })

  const backgroundColors = [
    "var(--orange-50)", // Light background
    "var(--orange-100)", // Medium background
    "var(--orange-200)", // Darker background
  ]

  return (
    <div className="flex flex-col">
      {/* Debug panel */}
      <div className="bg-gray-100 p-4 mb-4 rounded-md text-xs overflow-auto max-h-40">
        <h3 className="font-bold mb-2">Debug Info:</h3>
        <pre>{JSON.stringify(debug, null, 2)}</pre>
      </div>

      <motion.div
        animate={{
          backgroundColor: backgroundColors[activeCard % backgroundColors.length],
        }}
        className="h-[30rem] overflow-y-auto flex justify-center relative space-x-10 rounded-md p-10"
        ref={ref}
      >
        <div className="div relative flex items-start px-4">
          <div className="max-w-2xl">
            {content.map((item, index) => (
              <div key={item.title + index} className="my-20">
                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: activeCard === index ? 1 : 0.6 }}
                  className="text-2xl font-bold text-gray-900"
                >
                  {item.title}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: activeCard === index ? 1 : 0.6 }}
                  className="text-lg text-gray-800 max-w-sm mt-5"
                >
                  {item.description}
                </motion.p>
              </div>
            ))}
            <div className="h-40" />
          </div>
        </div>
        <motion.div
          className={cn(
            "hidden lg:block h-60 w-80 rounded-md sticky top-10 overflow-hidden relative",
            contentClassName,
          )}
        >
          {/* Image container with proper sizing */}
          <div className="absolute inset-0">
            {content[activeCard]?.image ? (
              <Image
                src={content[activeCard].image || "/placeholder.svg"}
                alt={`Image for ${content[activeCard].title}`}
                fill
                style={{ objectFit: "cover" }}
                priority
                onError={(e) => {
                  console.error(`Failed to load image for: ${content[activeCard].title}`)
                  e.currentTarget.src = "/placeholder.svg?height=240&width=320"
                }}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <p className="text-gray-500">No image for card {activeCard}</p>
              </div>
            )}
          </div>
          {/* Content overlay - display text from content item */}
          <div className="relative z-10 flex items-center justify-center h-full w-full">
            {content[activeCard].text && (
              <div className="text-white text-xl font-bold p-4 bg-black/30 rounded-md">{content[activeCard].text}</div>
            )}
            {content[activeCard].content ?? null}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
