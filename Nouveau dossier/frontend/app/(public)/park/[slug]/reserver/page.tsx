"use client"
import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import TicketPurchaseModal from "@/components/booking/ticket-purchase-modal"
import { ModalProvider } from "@/components/useModalStore/useModalStore"
import { useModalStore } from "@/components/useModalStore/useModalStore"
import { usePricing } from "@/hooks/use-pricing"
import { PricingService } from "@/services/pricing-service"
import { HeroSection } from "@/components/ui/hero-section"
import Image from "next/image"
import { ArrowRight, Calendar, Clock, Info, MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CartProvider, useCart } from "@/components/providers/cart-provider"
import { toast } from "react-hot-toast"
import { PaymentProcessor } from "@/components/payment/payment-processor"
import { useAuth } from "@/hooks/useAuth"
import { useAuthModal } from "@/hooks/use-auth-modal"
import type { CartItem } from "@/types/cart"
import { ParkService } from "@/services/park-service"
import type { Park } from "@/types/Park"

interface ParkPageProps {
  params: {
    slug: string
  }
}

export default function AdventureParkPage({ params }: ParkPageProps) {
  // Use React.use to unwrap the params object
  const unwrappedParams = use(params)
  const slug = Array.isArray(unwrappedParams.slug) ? unwrappedParams.slug[0] : unwrappedParams.slug

  return (
    <CartProvider>
      <ModalProvider>
        <AdventureParkContent parkId={slug} />
      </ModalProvider>
    </CartProvider>
  )
}

function AdventureParkContent({ parkId }: { parkId: string }) {
  const router = useRouter()
  const { pricing, loading, error } = usePricing(parkId)
  const [selectedPricingId, setSelectedPricingId] = useState<string>("")
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const { isAuthenticated } = useAuth()
  const { onOpen } = useAuthModal()
  const { addItem, subtotal } = useCart()
  const { setOpen } = useModalStore()
  const [park, setPark] = useState<Park | null>(null)
  const [loadingPark, setLoadingPark] = useState(true)

  useEffect(() => {
    const fetchPark = async () => {
      try {
        setLoadingPark(true)
        const parkData = await ParkService.getParkById(parkId)
        setPark(parkData.data)
      } catch (err) {
        console.error("Error fetching park:", err)
        toast.error("Impossible de charger les informations du parc")
      } finally {
        setLoadingPark(false)
      }
    }

    fetchPark()
  }, [parkId])

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        await PricingService.getAllPricing(parkId)
      } catch (err) {
        console.error("Error fetching pricing:", err)
        toast.error("Impossible de charger les tarifs")
      }
    }
    fetchPrices()
  }, [parkId])

  const handleAddToCart = async (item: any) => {
    try {
      if (!isAuthenticated) {
        toast.error("Veuillez vous connecter pour ajouter au panier")
        onOpen("login")
        return
      }

      // Format the item for the cart service
      const cartItem: CartItem = {
        _id: item.pricingId, // Using pricingId as the cart item ID
        park: parkId,
        pricingId: item.pricingId,
        pricingName: item.name,
        timeSlotInstanceId: item.timeSlotId || "",
        quantity: item.quantity || 1,
        unitPrice: item.price,
        date: item.date,
        startTime: item.startTime,
        endTime: item.endTime,
        // Add any other required fields from the CartItem type
      }

      // Add to local cart state
      addItem(cartItem)

      toast.success("Ajouté au panier avec succès!")
      setOpen(false)

      // Open payment modal
      setIsPaymentModalOpen(true)
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast.error("Erreur lors de l'ajout au panier")
    }
  }

  const handleBookClick = (pricingId: string) => {
    if (!isAuthenticated) {
      toast.error("Veuillez vous connecter pour réserver")
      onOpen("login")
      return
    }

    setSelectedPricingId(pricingId)
    setOpen(true)
  }

  const handlePaymentSuccess = () => {
    // Redirect to success page or dashboard
    router.push("/payment-success")
  }

  // Find the selected pricing object to pass to the modal
  const selectedPricing = pricing.find((p) => p._id === selectedPricingId) || {
    _id: selectedPricingId,
    name: "Parcours Aventure",
    price: 24.99,
    description: "Parcours en hauteur avec tyrolienne et ponts de singe",
  }

  // Helper function to get random features for fallback cards
  const getRandomFeatures = () => {
    const features = [
      "Tyrolienne",
      "Ponts suspendus",
      "Escalade",
      "Parcours enfants",
      "Parcours adultes",
      "Haute altitude",
      "Débutant",
      "Intermédiaire",
      "Expert",
      "Accessible PMR",
    ]
    const count = Math.floor(Math.random() * 3) + 1 // 1-3 features
    const selectedFeatures = []
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * features.length)
      selectedFeatures.push(features[randomIndex])
      features.splice(randomIndex, 1) // Remove selected feature to avoid duplicates
    }
    return selectedFeatures
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <HeroSection
        title="Réservez Votre Aventure"
        description="Choisissez parmi nos activités passionnantes et réservez dès maintenant pour une expérience inoubliable."
        videoSrc={park?.headerMedia || `/public/clip.mp4`}
        backgroundOverlay={true}
        height="medium"
        align="center"
      >
        <div className="flex flex-wrap gap-4 justify-center mt-4">
          <Button className="bg-primary hover:bg-primary/90">
            Voir les disponibilités <Calendar className="ml-2 h-4 w-4" />
          </Button>
          <Button variant="outline" className="bg-background/20 text-white border-white/20 hover:bg-background/30">
            En savoir plus <Info className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </HeroSection>

      {/* Activity Cards */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Nos Activités</h2>
          <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
            Découvrez nos différentes activités et choisissez celle qui vous convient le mieux.
          </p>
        </div>

        {loading || loadingPark ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <span className="ml-3 text-muted-foreground">Chargement des activités...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="bg-destructive/10 text-destructive rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-lg font-medium mb-2">Une erreur s'est produite</h3>
              <p className="mb-4">Impossible de charger les activités. Veuillez réessayer ultérieurement.</p>
              <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/10">
                Réessayer
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pricing.length > 0 ? (
              pricing.map((item) => (
                <Card
                  key={item._id}
                  className="overflow-hidden flex flex-col h-full transition-all duration-200 hover:shadow-md"
                >
                  <div className="relative h-48 w-full">
                    <Image
                      fill
                      src={item.image || "/placeholder.svg?height=200&width=400"}
                      alt={item.name}
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                        <Clock className="mr-1 h-3 w-3" /> 2-3h
                      </Badge>
                    </div>
                  </div>

                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{item.name}</CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                          <span>{park?.name || "Parc Aventure"}</span>
                        </CardDescription>
                      </div>
                      <Badge className="text-sm font-medium">{item.price.toFixed(2)} €</Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-grow">
                    <p className="text-muted-foreground">{item.description}</p>

                    <div className="flex flex-wrap gap-2 mt-4">
                      {/* Generate random features if none provided */}
                      {(item.features || getRandomFeatures()).map((feature, index) => (
                        <Badge key={index} variant="outline" className="bg-primary/10 text-primary border-primary/20">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>

                  <CardFooter>
                    <Button onClick={() => handleBookClick(item._id)} className="w-full">
                      Réserver maintenant
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              // Fallback cards if no pricing data is available
              <>
                {[
                  {
                    id: "fallback1",
                    name: "Parcours Orange",
                    description: "3 parcours en hauteur avec tyrolienne et ponts de singe",
                    price: 24.99,
                    features: ["Tyrolienne", "Débutant", "Famille"],
                  },
                  {
                    id: "fallback2",
                    name: "Parcours Extrême",
                    description: "5 parcours avancés avec obstacles à haute altitude",
                    price: 34.99,
                    features: ["Haute altitude", "Expert", "Sensations fortes"],
                  },
                  {
                    id: "fallback3",
                    name: "Pack Famille",
                    description: "Accès illimité aux parcours pour 4 personnes",
                    price: 89.99,
                    features: ["4 personnes", "Tous niveaux", "Économique"],
                  },
                ].map((item) => (
                  <Card
                    key={item.id}
                    className="overflow-hidden flex flex-col h-full transition-all duration-200 hover:shadow-md"
                  >
                    <div className="relative h-48 w-full">
                      <Image
                        fill
                        src="/placeholder.svg?height=200&width=400"
                        alt={item.name}
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                          <Clock className="mr-1 h-3 w-3" /> 2-3h
                        </Badge>
                      </div>
                    </div>

                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{item.name}</CardTitle>
                          <CardDescription className="flex items-center mt-1">
                            <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                            <span>{park?.name || "Parc Aventure"}</span>
                          </CardDescription>
                        </div>
                        <Badge className="text-sm font-medium">{item.price.toFixed(2)} €</Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="flex-grow">
                      <p className="text-muted-foreground">{item.description}</p>

                      <div className="flex flex-wrap gap-2 mt-4">
                        {item.features.map((feature, index) => (
                          <Badge key={index} variant="outline" className="bg-primary/10 text-primary border-primary/20">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>

                    <CardFooter>
                      <Button onClick={() => handleBookClick(item.id)} className="w-full">
                        Réserver maintenant
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </>
            )}
          </div>
        )}
      </section>

      {/* Ticket Purchase Modal */}
      <TicketPurchaseModal
        onAddToCart={handleAddToCart}
        parkId={parkId}
        pricingId={selectedPricingId}
        selectedPricing={selectedPricing}
      />

      {/* Payment Modal */}
      <PaymentProcessor
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={handlePaymentSuccess}
        totalAmount={subtotal}
      />
    </div>
  )
}
