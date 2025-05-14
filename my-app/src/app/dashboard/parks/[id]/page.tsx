import { ParkForm } from "@/components/parks copy/park-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function EditParkPage({ params }: { params: { id: string } }): Promise<JSX.Element> {
  const parkId = await params.id
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Link href="/dashboard/parks">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Edit Park</h1>
      </div>
      <ParkForm parkId={parkId} />
    </div>
  )
}
