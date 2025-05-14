"use client"

import { useParams } from "next/navigation"
import { ActivityForm } from "@/components/activities/activity-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function EditActivityPage() {
  const { id } = useParams()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Link href="/dashboard/activities">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Edit Activity</h1>
      </div>
      <ActivityForm activityId={id} />
    </div>
  )
}
