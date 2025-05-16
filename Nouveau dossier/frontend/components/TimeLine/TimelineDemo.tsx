"use client"

import Image from "next/image"
import type React from "react"
import { useEffect, useState } from "react"
import { Timeline } from "./timeline"
import { ChangelogService } from "@/services/index"

// Define the types for our data
interface ChangelogType {
  _id: string
  title: string
  content: {
    description: string
    updates: string[]
    images: {
      src: string
    }[]
  }
}

interface TimelineItem {
  title: string
  content: React.ReactNode
}

export function TimelineDemo() {
  const [timelineData, setTimelineData] = useState<TimelineItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchChangelogs = async () => {
      try {
        setLoading(true)
        const changelogs = await ChangelogService.getChangelogs()

        // Transform the changelog data to match the Timeline component's expected format
        const formattedData = changelogs.map((changelog: ChangelogType) => ({
          title: changelog.title,
          content: (
            <div>
              <p className="text-neutral-800 dark:text-neutral-200 text-xs md:text-sm font-normal mb-8">
                {changelog.content.description}
              </p>

              {changelog.content.updates.length > 0 && (
                <div className="mb-8">
                  {changelog.content.updates.map((update, index) => (
                    <div
                      key={index}
                      className="flex gap-2 items-center text-neutral-700 dark:text-neutral-300 text-xs md:text-sm"
                    >
                      ✅ {update}
                    </div>
                  ))}
                </div>
              )}

              {changelog.content.images.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  {changelog.content.images.map((image, index) => (
                    <Image
                      key={index}
                      src={image.src || "/placeholder.svg"}
                      alt={`Image ${index + 1}`}
                      width={500}
                      height={500}
                      className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
                    />
                  ))}
                </div>
              )}
            </div>
          ),
        }))

        setTimelineData(formattedData)
      } catch (err) {
        console.error("Error fetching changelogs:", err)
        setError("Failed to load timeline data")
      } finally {
        setLoading(false)
      }
    }

    fetchChangelogs()
  }, [])

  if (loading) {
    return <div className="w-full text-center py-8">Loading timeline...</div>
  }

  if (error) {
    return <div className="w-full text-center py-8 text-red-500">{error}</div>
  }

  return (
    <div className="w-full">
      {timelineData.length > 0 ? (
        <Timeline data={timelineData} />
      ) : (
        <div className="text-center py-8">No timeline entries found</div>
      )}
    </div>
  )
}
