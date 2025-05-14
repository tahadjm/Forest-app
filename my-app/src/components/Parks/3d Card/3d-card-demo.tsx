"use client"
import { CardBody, CardContainer, CardItem } from "./3d-card"
import Link from "next/link"

interface CardProps {
  title: string
  description: string
  imageUrl: string
  link: string
}

export function ThreeDCardDemo({ title, description, imageUrl, link }: CardProps) {
  // Default fallback image - a simple colored div with text
  const defaultImage =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 800 400' %3E%3Cdefs%3E%3ClinearGradient id='a' gradientUnits='userSpaceOnUse' x1='0' x2='0' y1='0' y2='100%25' gradientTransform='rotate(240)'%3E%3Cstop offset='0' stopColor='%23FF8C00'/%3E%3Cstop offset='1' stopColor='%23FFD700'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23a)' width='800' height='400'/%3E%3Cg fill='%23FFF'%3E%3Ctext x='50%25' y='50%25' fontSize='24' textAnchor='middle' dominantBaseline='middle'%3EImage%3C/text%3E%3C/g%3E%3C/svg%3E"

  return (
    <CardContainer className="inter-var w-full max-w-sm mx-auto">
      <CardBody className="bg-orange-100 relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-full h-auto rounded-xl p-4 sm:p-6 border transition-all duration-300">
        <CardItem translateZ="50" className="text-xl font-bold text-neutral-600 dark:text-white">
          {title || "No Title"}
        </CardItem>
        <CardItem translateZ="60" className="text-neutral-500 text-sm max-w-sm mt-2 dark:text-neutral-300">
          {description?.length > 100 ? `${description.substring(0, 100)}...` : description || "No Description"}
        </CardItem>

        <CardItem translateZ="100" className="w-full mt-4">
          {/* Use img tag with inline SVG fallback */}
          <img
            src={imageUrl || defaultImage}
            className="h-48 sm:h-60 w-full object-cover rounded-xl group-hover/card:shadow-xl"
            alt={title || "Park image"}
            onError={(e) => {
              console.log("Image failed to load:", imageUrl)
              e.currentTarget.src = defaultImage
            }}
            crossOrigin="anonymous"
          />
        </CardItem>

        <div className="flex justify-between items-center mt-6 sm:mt-10">
          <CardItem
            translateZ={20}
            as={Link}
            href={link || "#"}
            className="px-4 py-2 rounded-xl bg-black dark:bg-white dark:text-black text-white text-xs font-bold"
          >
            Discover
          </CardItem>
        </div>
      </CardBody>
    </CardContainer>
  )
}
