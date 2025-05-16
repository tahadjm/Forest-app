import { PricingList } from "@/components/pricing/pricing-list"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"

export default function PricingPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Pricing</h1>
        <Link href="/dashboard/pricing/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Pricing
          </Button>
        </Link>
      </div>
      <PricingList />
    </div>
  )
}
