import { ActivitiesList } from "@/components/activities/activities-list"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"

export default function ActivitiesPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Activities</h1>
        <Link href="/dashboard/activities/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Activity
          </Button>
        </Link>
      </div>
      <ActivitiesList />
    </div>
  )
}
