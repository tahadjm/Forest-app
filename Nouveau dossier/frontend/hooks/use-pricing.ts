"use client"

import { useState, useEffect } from "react"
import { PricingService, type Pricing } from "@/services/pricing-service"

export function usePricing(parkId: string) {
  const [pricing, setPricing] = useState<Pricing[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!parkId) {
      console.warn("No parkId provided to usePricing hook")
      return
    }

    const fetchPricing = async () => {
      setLoading(true)
      setError(null)
      try {
        console.log(`Fetching pricing data for park: ${parkId}`)
        const response = await PricingService.getAllPricing(parkId)
        const pricingData = response.pricing
        console.log(pricingData)

        console.log(`Received ${pricingData.length} pricing items`)
        setPricing(pricingData)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch pricing"
        setError(errorMessage)
        console.error("Error fetching pricing:", err)
        // Set pricing to empty array to ensure we don't use stale data
        setPricing([])
      } finally {
        setLoading(false)
      }
    }

    fetchPricing()
  }, [parkId])

  return { pricing, loading, error }
}
