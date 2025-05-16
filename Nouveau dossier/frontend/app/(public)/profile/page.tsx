"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileForm } from "@/components/profile/profile-form"
import { SecurityForm } from "@/components/profile/security-form"
import { TransactionHistory } from "@/components/profile/transaction-history"
import { HeroSection } from "@/components/ui/hero-section"
import { useRouter, useSearchParams } from "next/navigation"
import ProtectedRoute from "@/components/auth/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, ArrowRight } from "lucide-react"
import Link from "next/link"
import { AuthService } from "@/services"
import type { User } from "@/services/auth-service"

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  )
}

function ProfileContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get("tab") || "profile"
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [user, setUser] = useState<User | null>(null)

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    router.push(`/profile?tab=${value}`, { scroll: false })
  }
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const res = await AuthService.getCurrentUser()
        if (!res) {
          return
        }
        if (!res.data) {
          return
        }
        console.log("Current User:", res.data)
        setUser(res.data)
      } catch (error) {
        console.error("Error fetching current user:", error)
        setUser(null)
      }
    }

    getCurrentUser()
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection
        title="Mon Profil"
        description="Gérez vos informations personnelles et vos préférences"
        backgroundType="color"
        height="small"
      />

      <div className="container mx-auto py-12 px-4">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="security">Sécurité</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-8">
            <ProfileForm user={user} />

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5 text-primary" />
                  Mes Réservations
                </CardTitle>
                <CardDescription>Consultez et gérez vos réservations</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Accédez à l'historique complet de vos réservations, consultez les détails et gérez vos réservations à
                  venir.
                </p>
                <Button asChild>
                  <Link href="/reservation" className="flex items-center">
                    Voir mes réservations
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <TransactionHistory />
          </TabsContent>

          <TabsContent value="security">
            <SecurityForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
