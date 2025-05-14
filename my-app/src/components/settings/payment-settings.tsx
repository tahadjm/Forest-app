"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

export function PaymentSettings() {
  const [stripeEnabled, setStripeEnabled] = useState(true)
  const [paypalEnabled, setPaypalEnabled] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you would save the payment settings here
    console.log("Payment settings saved")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Settings</CardTitle>
        <CardDescription>Configure your adventure park payment options</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="stripe-enabled">Enable Stripe Payments</Label>
              <Switch id="stripe-enabled" checked={stripeEnabled} onCheckedChange={setStripeEnabled} />
            </div>
            {stripeEnabled && (
              <div className="space-y-2">
                <Label htmlFor="stripe-api-key">Stripe API Key</Label>
                <Input id="stripe-api-key" placeholder="Enter your Stripe API key" />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="paypal-enabled">Enable PayPal Payments</Label>
              <Switch id="paypal-enabled" checked={paypalEnabled} onCheckedChange={setPaypalEnabled} />
            </div>
            {paypalEnabled && (
              <div className="space-y-2">
                <Label htmlFor="paypal-client-id">PayPal Client ID</Label>
                <Input id="paypal-client-id" placeholder="Enter your PayPal Client ID" />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Default Currency</Label>
            <Select defaultValue="usd">
              <SelectTrigger id="currency">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="usd">USD - US Dollar</SelectItem>
                <SelectItem value="eur">EUR - Euro</SelectItem>
                <SelectItem value="gbp">GBP - British Pound</SelectItem>
                <SelectItem value="jpy">JPY - Japanese Yen</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-terms">Payment Terms</Label>
            <Select defaultValue="full">
              <SelectTrigger id="payment-terms">
                <SelectValue placeholder="Select payment terms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">Full payment required</SelectItem>
                <SelectItem value="deposit">Deposit required</SelectItem>
                <SelectItem value="onsite">Pay on-site</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit">Save Payment Settings</Button>
        </form>
      </CardContent>
    </Card>
  )
}
