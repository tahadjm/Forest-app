"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FAQManager } from "@/components/content/faq-manager"
import { NewsManager } from "@/components/content/news-manager"
import { AboutPageManager } from "@/components/content/about-page-manager"
import { SecuritySectionManager } from "@/components/content/security-section-manager"
import { ChangelogManager } from "@/components/content/changelog-manager"

export default function ContentManagementPage() {
  const [activeTab, setActiveTab] = useState("faq")

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Content Management</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Website Content</CardTitle>
          <CardDescription>Create, edit, and organize content for different sections of your website.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="faq" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-5 mb-8">
              <TabsTrigger value="faq">FAQs</TabsTrigger>
              <TabsTrigger value="news">News</TabsTrigger>
              <TabsTrigger value="about">About Page</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="changelog">Changelog</TabsTrigger>
            </TabsList>

            <TabsContent value="faq" className="space-y-4">
              <FAQManager />
            </TabsContent>

            <TabsContent value="news" className="space-y-4">
              <NewsManager />
            </TabsContent>

            <TabsContent value="about" className="space-y-4">
              <AboutPageManager />
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <SecuritySectionManager />
            </TabsContent>

            <TabsContent value="changelog" className="space-y-4">
              <ChangelogManager />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
