import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-adventure-50 to-white flex flex-col items-center justify-center p-4">
      <div className="relative">
        <Loader2 className="h-16 w-16 text-adventure-500 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-10 w-10 rounded-full bg-adventure-100"></div>
        </div>
      </div>
      <p className="mt-6 text-adventure-700 font-medium">Chargement de votre confirmation...</p>
      <p className="mt-2 text-sm text-gray-500">Veuillez patienter un instant</p>
    </div>
  )
}
