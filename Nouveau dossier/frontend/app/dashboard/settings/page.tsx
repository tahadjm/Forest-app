import { PaymentSettings } from "@/components/settings/payment-settings"

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      <PaymentSettings />
    </div>
  )
}
