"use client"

import type React from "react"

import { motion, useInView } from "framer-motion"
import { useEffect, useState, useRef } from "react"
import { Layers3 } from "lucide-react"
import { GlowingEffect } from "@/components/glowing-effect/glowing-effect"

type SubParcoursProps = {
  name: string
  subParcours: {
    name: string
    numberOfWorkshops: number
    tyroliennes: number
    description: string
  }[]
}

const SubParcoursSection: React.FC<SubParcoursProps> = ({ name, subParcours }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "0px 0px -100px 0px" })

  return (
    <div ref={ref} className="max-w-6xl mx-auto mt-8 px-6">
      <h2 className="text-3xl font-bold text-orange-600 mb-6 text-center">
        {name} - {subParcours.length} parcours
      </h2>

      {/* Grid Layout for Sub-Parcours */}
      <ul className="grid grid-cols-1 md:grid-cols-12 md:grid-rows-3 gap-6">
        {subParcours.map((sub, index) => (
          <GridItem
            key={index}
            area={getGridArea(index)}
            icon={<Layers3 className="h-5 w-5 text-black dark:text-neutral-400" />}
            title={sub.name}
            workshops={sub.numberOfWorkshops}
            tyroliennes={sub.tyroliennes}
            description={sub.description}
            isInView={isInView} // Pass visibility state
          />
        ))}
      </ul>
    </div>
  )
}

interface GridItemProps {
  area: string
  icon: React.ReactNode
  title: string
  workshops: number
  tyroliennes: number
  description: string
  isInView: boolean
}

const GridItem = ({ area, icon, title, workshops, tyroliennes, description, isInView }: GridItemProps) => {
  return (
    <li className={`min-h-[14rem] list-none ${area}`}>
      <div className="relative h-full rounded-2.5xl border p-2 md:rounded-3xl md:p-3">
        <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} />
        <div className="relative flex h-full flex-col justify-between gap-4 overflow-hidden rounded-xl border-0.75 p-6 bg-white shadow-md dark:shadow-lg">
          <div className="relative flex flex-1 flex-col justify-between gap-3">
            <div className="w-fit rounded-lg border border-gray-600 p-2">{icon}</div>
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-black dark:text-white">{title}</h3>
              <h2 className="text-md text-gray-700 dark:text-neutral-400">
                <p>
                  <strong>🔹 Workshops:</strong> <AnimatedNumber target={workshops} isInView={isInView} />
                </p>
                <p>
                  <strong>🔹 Ziplines:</strong> <AnimatedNumber target={tyroliennes} isInView={isInView} />
                </p>
                <p>{description}</p>
              </h2>
            </div>
          </div>
        </div>
      </div>
    </li>
  )
}

// Animated Number Component
const AnimatedNumber: React.FC<{ target: number; isInView: boolean }> = ({ target, isInView }) => {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!isInView) return

    const intervalSpeed = 50 // Slower animation
    const increment = Math.ceil(target / 50) // Adjust the step size

    const interval = setInterval(() => {
      setValue((prev) => {
        const nextValue = prev + increment
        return nextValue >= target ? target : nextValue
      })
    }, intervalSpeed)

    return () => clearInterval(interval)
  }, [target, isInView])

  return (
    <motion.span
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 2 }}
      className="text-blue-500 font-bold"
    >
      {value}
    </motion.span>
  )
}

// Assign grid area dynamically based on index
const getGridArea = (index: number) => {
  const areas = [
    "md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/5]",
    "md:[grid-area:1/7/2/13] xl:[grid-area:2/1/3/5]",
    "md:[grid-area:2/1/3/7] xl:[grid-area:1/5/3/8]",
    "md:[grid-area:2/7/3/13] xl:[grid-area:1/8/2/13]",
    "md:[grid-area:3/1/4/13] xl:[grid-area:2/8/3/13]",
  ]
  return areas[index % areas.length]
}

export default SubParcoursSection
