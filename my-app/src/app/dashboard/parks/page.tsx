import { ParksList } from "@/components/parks copy/parks-list"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"
import { ProtectedComponent } from "@/components/protectedComponent"

export default function ParksPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Parks</h1>
        <ProtectedComponent>
          <Link href="/dashboard/parks/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Park
            </Button>
          </Link>
        </ProtectedComponent>
      </div>
      <ParksList />
    </div>
  )
}
