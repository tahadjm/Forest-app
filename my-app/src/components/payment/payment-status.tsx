import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, XCircle } from "lucide-react"

interface PaymentStatusProps {
  status: "pending" | "paid" | "failed" | "cancelled"
}

export function PaymentStatus({ status }: PaymentStatusProps) {
  switch (status) {
    case "pending":
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          En attente
        </Badge>
      )
    case "paid":
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Payé
        </Badge>
      )
    case "failed":
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Échoué
        </Badge>
      )
    case "cancelled":
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Annulé
        </Badge>
      )
    default:
      return null
  }
}
