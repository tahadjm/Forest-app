"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, Clock, ImageIcon, Video, XCircle } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
// import Booknow from "@/components/Booknow/Booknow"

interface Feature {
  features: string
  description: string
  available: boolean
  _id: { $oid: string }
}

interface Category {
  name: string
  ageRequirement: string
  heightRequirement: string
  durationEstimated: string
  descriptionofCategory: string
  _id: { $oid: string }
  features: Feature[]
  images?: string[]
  video?: string
}

interface Activity {
  _id: { $oid: string }
  name: string
  parkId: { $oid: string }
  description: string
  categories: Category[]
}

function CategoryContent({ category }: { category: Category }) {
  const [selectedImage, setSelectedImage] = useState(category.images?.[0] || null)

  return (
    <div className="space-y-8">
      {/* Images Gallery Section */}
      {category.images && category.images.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <ImageIcon className="w-5 h-5" />
            <h3 className="text-2xl font-bold">Gallery</h3>
          </div>

          {/* Main selected image */}
          <div className="relative w-full h-64 md:h-80 mb-4 rounded-lg overflow-hidden">
            {selectedImage && (
              <Image src={selectedImage || "/placeholder.svg"} alt={category.name} fill className="object-cover" />
            )}
          </div>

          {/* Thumbnails */}
          <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
            {category.images.map((img, index) => (
              <div
                key={index}
                className={`relative h-16 md:h-20 rounded-md overflow-hidden cursor-pointer transition-all ${
                  selectedImage === img ? "ring-2 ring-amber-500 scale-95" : "hover:scale-95"
                }`}
                onClick={() => setSelectedImage(img)}
              >
                <Image
                  src={img || "/placeholder.svg"}
                  alt={`${category.name} thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Video Section (Optional) */}
      {category.video && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Video className="w-5 h-5" />
            <h3 className="text-2xl font-bold">Video</h3>
          </div>
          <div className="relative w-full aspect-video rounded-lg overflow-hidden">
            <video src={category.video} controls poster={category.images?.[0]} className="w-full h-full object-cover">
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}

      {/* Requirements Card */}
      <Card>
        <CardHeader>
          <CardTitle>Requirements</CardTitle>
          <CardDescription>Age and height requirements for this category</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="px-3 py-1">
              Age: {category.ageRequirement}
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              Height: {category.heightRequirement}
            </Badge>
            <Badge variant="outline" className="px-3 py-1 flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{category.durationEstimated}</span>
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Features Grid */}
      <div>
        <h3 className="text-2xl font-bold mb-4">Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {category.features.map((feature) => (
            <Card key={feature._id.$oid} className="border-l-4 border-l-amber-500">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl">{feature.features}</CardTitle>
                  {feature.available ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p>{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export function ActivityContent({ activity }: { activity: Activity }) {
  return (
    <div className="w-full h-full overflow-auto rounded-2xl bg-gradient-to-b from-amber-50 to-amber-100 p-6 text-black">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">{activity.name}</h2>
          <p className="text-lg">{activity.description}</p>
        </div>

        <Tabs defaultValue={activity.categories[0]._id.$oid} className="w-full">
          <TabsList className="w-full justify-start mb-6 bg-amber-100/50 p-1 rounded-lg">
            {activity.categories.map((category) => (
              <TabsTrigger
                key={category._id.$oid}
                value={category._id.$oid}
                className="data-[state=active]:bg-amber-200 data-[state=active]:text-amber-900"
              >
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
          {activity.categories.map((category) => (
            <TabsContent key={category._id.$oid} value={category._id.$oid}>
              <CategoryContent category={category} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}
