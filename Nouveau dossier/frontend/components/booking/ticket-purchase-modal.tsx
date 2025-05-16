"use client"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Check, Clock, Info, MapPin, Users } from "lucide-react"
import { useModalStore } from "@/components/useModalStore/useModalStore"
import TimeSlotSelector from "@/components/booking/time-slot-selector"
import CartService from "@/services/cart-service"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import PricingService from "@/services/pricing-service"
import { TimeSlotService } from "@/services/time-slot-service"

interface TicketPurchaseModalProps {
  onAddToCart?: (item: any) => void
  parkId: string
  pricingId: string
  selectedPricing: any
}

export default function TicketPurchaseModal({
  onAddToCart,
  parkId,
  pricingId,
  selectedPricing,
}: TicketPurchaseModalProps) {
  const { isOpen, setOpen } = useModalStore()
  const [step, setStep] = useState<"date" | "time" | "details">("date")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [selectedTimeSlotId, setSelectedTimeSlotId] = useState<string | null>(null)
  const [priceAdjustment, setPriceAdjustment] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false)
  const [availableTickets, setAvailableTickets] = useState(0)
  const { isAuthenticated } = useAuth()
  const [startTime, setStartTime] = useState<string | null>(null)
  const [endTime, setEndTime] = useState<string | null>(null)

  useEffect(() => {
    setIsUserAuthenticated(isAuthenticated)
  }, [isAuthenticated])

  // Calculate total price with adjustment
  const basePrice = selectedPricing?.price || 24.99
  const adjustedPrice = basePrice + priceAdjustment
  const totalPrice = adjustedPrice * quantity

  const disabledDates = {
    before: new Date(),
  }

  const handleNextStep = () => {
    if (step === "date" && selectedDate) {
      setStep("time")
    } else if (step === "time" && selectedTime) {
      setStep("details")
    }
  }

  const handlePreviousStep = () => {
    if (step === "time") {
      setStep("date")
    } else if (step === "details") {
      setStep("time")
    }
  }

  const handleAddToCart = async () => {
    if (!isUserAuthenticated) {
      toast.error("Veuillez vous connecter pour ajouter au panier")
      router.push("/login")
      return
    }

    if (!selectedDate || !selectedTime || !selectedTimeSlotId) {
      toast.error("Veuillez sélectionner une date et un créneau horaire")
      return
    }

    setLoading(true)

    try {
      // Validate inputs before sending to service
      if (!pricingId || !selectedTimeSlotId) {
        throw new Error("ID de tarif ou de créneau invalide")
      }

      // Improved quantity validation
      if (!availableTickets || availableTickets <= 0) {
        throw new Error("Aucune place disponible pour ce créneau")
      }

      if (quantity < 1) {
        throw new Error("La quantité minimum est de 1")
      }

      if (quantity > availableTickets) {
        throw new Error(`La quantité maximum est de ${availableTickets}`)
      }

      if (isNaN(adjustedPrice) || adjustedPrice <= 0) {
        throw new Error("Prix unitaire invalide")
      }

      let pricingName = ""
      try {
        const res = await PricingService.getPricingById(pricingId, parkId)
        console.log("Pricing response:", res)

        // Check if res and res.data exist before accessing properties
        if (res && res.data && res.data.name) {
          pricingName = res.data.name
        } else {
          // Fallback to selectedPricing if available
          pricingName = selectedPricing?.name || "Unknown pricing"
          console.log("Using fallback pricing name:", pricingName)
        }
      } catch (error) {
        console.error("Error fetching pricing details:", error)
        // Fallback to selectedPricing if available
        pricingName = selectedPricing?.name || "Unknown pricing"
        console.log("Using fallback pricing name after error:", pricingName)
      }
      console.log("selected time slot is:", selectedTimeSlotId)
      if (selectedTimeSlotId) {
        const timeSlotInstance = await TimeSlotService.getTimeSlotInstanceById(selectedTimeSlotId)
        console.log("fetched time slot instance:", timeSlotInstance)
        if (timeSlotInstance) {
          const { startTime: slotStartTime, endTime: slotEndTime } = timeSlotInstance
          setStartTime(slotStartTime)
          setEndTime(slotEndTime)
          console.log("Time slot instance details:", slotStartTime, slotEndTime)
        } else {
          console.error("Invalid time slot instance data")
        }
      }

      // Format date as YYYY-MM-DD
      const formattedDate = selectedDate.toISOString().split("T")[0]

      console.log("Request payload:", {
        pricingId,
        instanceId: selectedTimeSlotId,
        quantity,
        unitPrice: adjustedPrice,
        date: formattedDate,
        startTime,
        endTime,
      })
      const payload = {
        park: parkId,
        pricingId: pricingId,
        pricingName: selectedPricing.name,
        instanceId: selectedTimeSlotId, // Changed from slot to timeSlotInstanceId
        quantity,
        unitPrice: adjustedPrice,
        date: formattedDate,
        startTime,
        endTime,
      }

      // Add to cart using the service
      await CartService.addToCart(payload)

      if (onAddToCart) {
        onAddToCart({
          id: `${parkId}-${pricingId}-${selectedDate.toISOString()}-${selectedTime}`,
          name: selectedPricing.name,
          price: adjustedPrice,
          date: selectedDate,
          time: selectedTime,
          quantity: quantity,
          pricingId: pricingId,
          parkId: parkId,
          priceAdjustment: priceAdjustment,
        })
      }

      toast.success("Ajouté au panier avec succès")
      setOpen(false)

      // Reset state
      setStep("date")
      setSelectedDate(undefined)
      setSelectedTime(null)
      setSelectedTimeSlotId(null)
      setPriceAdjustment(0)
      setQuantity(1)
    } catch (error) {
      console.error("Failed to add item to cart:", error)

      // More specific error message based on the error
      if (error instanceof Error) {
        toast.error(`Erreur: ${error.message}`)
      } else {
        toast.error("Impossible d'ajouter l'article au panier")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleTimeSelect = (
    time: string,
    timeSlotInstanceId: string,
    adjustment = 0,
    availableTickets = 0,
    startTime: string | null = null,
    endTime: string | null = null,
  ) => {
    console.log(
      "Selected time:",
      time,
      "timeSlotInstanceId:",
      timeSlotInstanceId,
      "price adjustment:",
      adjustment,
      "available tickets:",
      availableTickets,
      "startTime:",
      startTime,
      "endTime:",
      endTime,
    )
    setSelectedTime(time)
    setSelectedTimeSlotId(timeSlotInstanceId)
    setPriceAdjustment(adjustment)
    setAvailableTickets(availableTickets)
    setStartTime(startTime)
    setEndTime(endTime)
    // Better quantity handling
    if (availableTickets <= 0) {
      setQuantity(1) // Default to 1 even if no tickets available (will be disabled)
    } else if (quantity > availableTickets) {
      setQuantity(availableTickets) // Set to max available
    } else if (quantity < 1) {
      setQuantity(1) // Ensure minimum of 1
    }
  }

  useEffect(() => {
    // Ensure quantity is always valid when availableTickets changes
    if (availableTickets > 0 && quantity > availableTickets) {
      setQuantity(availableTickets)
    } else if (availableTickets > 0 && quantity < 1) {
      setQuantity(1)
    }
  }, [availableTickets, quantity])

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px] md:max-w-[800px] bg-adventure-200">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#0f172a]">Réserver votre Ticket Aventure</DialogTitle>
          <DialogDescription className="text-[#334155]">
            Choisissez votre date, heure et nombre de participants
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "date" || step === "time" || step === "details" ? "bg-adventure-400 text-white" : "bg-adventure-100 text-adventure-600"}`}
            >
              1
            </div>
            <div
              className={`h-1 w-12 ${step === "time" || step === "details" ? "bg-adventure-400" : "bg-adventure-100"}`}
            ></div>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "time" || step === "details" ? "bg-adventure-400 text-white" : "bg-adventure-100 text-adventure-600"}`}
            >
              2
            </div>
            <div className={`h-1 w-12 ${step === "details" ? "bg-adventure-400" : "bg-adventure-100"}`}></div>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "details" ? "bg-adventure-400 text-white" : "bg-adventure-100 text-adventure-600"}`}
            >
              3
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`md:col-span-${step === "date" || step === "time" ? "2" : "1"}`}>
            {step === "date" && (
              <div className="space-y-4 bg-white p-4 rounded-lg">
                <h3 className="text-lg font-medium text-[#0f172a]">Sélectionnez une date</h3>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={disabledDates}
                  className="rounded-md border"
                />
              </div>
            )}

            {step === "time" && (
              <div className="space-y-4 bg-secondary p-4 rounded-lg">
                <h3 className="text-lg font-medium text-[#0f172a]">Choisissez un créneau horaire</h3>
                <p className="text-sm text-muted-foreground">
                  Pour le{" "}
                  {selectedDate?.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                </p>

                <TimeSlotSelector
                  parkId={parkId}
                  date={selectedDate}
                  onSelect={handleTimeSelect}
                  selectedTime={selectedTime}
                  pricingId={pricingId}
                />
              </div>
            )}

            {step === "details" && (
              <div className="space-y-4 bg-adventure-100 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-[#0f172a]">Détails de la réservation</h3>

                <div className="space-y-2">
                  <Label htmlFor="quantity" className="text-[#0f172a]">
                    Nombre de participants{" "}
                    <span className="text-sm text-adventure-600">({availableTickets} places disponibles)</span>
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="bg-white border-adventure-300"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      -
                    </Button>
                    <Input
                      id="quantity"
                      type="number"
                      className="w-20 text-center bg-white border-adventure-300"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Math.min(availableTickets, Number(e.target.value))))}
                      min={1}
                      max={availableTickets}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="bg-white border-adventure-300"
                      onClick={() => setQuantity(Math.min(availableTickets, quantity + 1))}
                      disabled={quantity >= availableTickets}
                    >
                      +
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[#0f172a]">Informations importantes</Label>
                  <div className="text-sm space-y-1 text-[#334155]">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-adventure-600" />
                      <span>Âge minimum: 8 ans</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-adventure-600" />
                      <span>Hauteur minimale: 1.30m</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-adventure-600" />
                      <span>Durée: 45 minutes</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="md:col-span-1">
            <Card className="bg-white border-adventure-300">
              <CardHeader className="pb-3 bg-adventure-100 rounded-t-lg">
                <CardTitle className="text-[#0f172a]">Récapitulatif</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-[#0f172a]">{selectedPricing.name}</h4>
                  <Badge className="bg-adventure-400 hover:bg-adventure-500">
                    {selectedPricing.description?.substring(0, 20)}...
                  </Badge>

                  {selectedDate && (
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-[#334155]">
                        {selectedDate.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                      </span>
                    </div>
                  )}

                  {selectedTime && (
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-[#334155]">{selectedTime}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm">
                    <Info className="h-4 w-4 text-adventure-600" />
                    <span className="text-[#334155]">
                      {quantity} {quantity > 1 ? "participants" : "participant"}
                    </span>
                  </div>
                </div>

                <Separator className="bg-adventure-100" />

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm text-[#334155]">Prix de base</span>
                    <span className="text-sm text-[#334155]">{basePrice.toFixed(2)} €</span>
                  </div>
                  {priceAdjustment !== 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-[#334155]">Ajustement horaire</span>
                      <span className="text-sm text-[#334155]">
                        {priceAdjustment > 0 ? "+" : ""}
                        {priceAdjustment.toFixed(2)} €
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-[#334155]">Prix unitaire</span>
                    <span className="text-sm text-[#334155]">{adjustedPrice.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[#334155]">Quantité</span>
                    <span className="text-sm text-[#334155]">x {quantity}</span>
                  </div>
                  <Separator className="my-2 bg-adventure-100" />
                  <div className="flex justify-between font-medium">
                    <span className="text-[#0f172a]">Total</span>
                    <span className="text-[#0f172a]">{totalPrice.toFixed(2)} €</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 rounded-b-lg">
                <div className="text-xs text-[#64748b]">
                  <p>Annulation gratuite jusqu'à 24h avant l'activité</p>
                  <p>Paiement sécurisé</p>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          {step !== "date" ? (
            <Button
              variant="outline"
              onClick={handlePreviousStep}
              className="bg-white border-adventure-300 hover:bg-adventure-100"
              disabled={loading}
            >
              Retour
            </Button>
          ) : (
            <div></div>
          )}

          {step !== "details" ? (
            <Button
              onClick={handleNextStep}
              disabled={(step === "date" && !selectedDate) || (step === "time" && !selectedTime) || loading}
              className="bg-adventure-400 hover:bg-adventure-500 text-white"
            >
              Continuer
            </Button>
          ) : (
            <Button
              onClick={handleAddToCart}
              className="bg-adventure-400 hover:bg-adventure-500 text-white"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Ajout en cours...
                </>
              ) : (
                "Ajouter au panier"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
