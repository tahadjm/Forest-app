import { PricingForm } from "@/components/pricing/pricing-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function EditPricingPage({ params }: { params: { id: string; parkId: string } }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Link href="/dashboard/pricing">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Edit Pricing</h1>
      </div>
      <PricingForm pricingId={params.id} parkId={params.parkId} />
    </div>
  )
}
