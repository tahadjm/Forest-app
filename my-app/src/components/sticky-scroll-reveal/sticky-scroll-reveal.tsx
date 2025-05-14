"use client"
import React, { useRef } from "react"
import { useMotionValueEvent, useScroll } from "framer-motion"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import Image from "next/image"

export const StickyScroll = ({
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
  const ref = useRef<any>(null)
  const { scrollYProgress } = useScroll({
    container: ref,
    offset: ["start start", "end start"],
  })
  const cardLength = content.length

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

  // Since all images are the same, we can use a single image path
  const imagePath = content[activeCard]?.image || "/placeholder.svg"

  return (
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
        className={cn("hidden lg:block h-60 w-80 rounded-md sticky top-10 overflow-hidden relative", contentClassName)}
      >
        {/* Since all images are the same, we can use a single image */}
        <div className="absolute inset-0">
          {/* Use a key that doesn't change to prevent re-rendering */}
          <Image
            key="static-image"
            src={imagePath || "/placeholder.svg"}
            alt="Feature image"
            fill
            style={{ objectFit: "cover" }}
            priority
          />
        </div>

        {/* Content overlay - display text from content item */}
        <div className="relative z-10 flex items-center justify-center h-full w-full">
          {content[activeCard]?.text && (
            <div className="text-white text-xl font-bold p-4 bg-black/30 rounded-md">{content[activeCard].text}</div>
          )}
          {content[activeCard].content ?? null}
        </div>
      </motion.div>
    </motion.div>
  )
}
