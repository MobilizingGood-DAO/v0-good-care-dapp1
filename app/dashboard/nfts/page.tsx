"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function NFTsPage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading state
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Your NFT Collection</h1>
        <p className="text-muted-foreground mt-2">
          View your daily reflection NFTs and track your wellness journey on the GOOD CARE Network.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-4">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <NFTCard
            title="Daily Reflection - 2024-05-01"
            description="Feeling grateful today"
            image="/placeholder.svg?height=300&width=300&text=Reflection"
          />
          <NFTCard
            title="Daily Reflection - 2024-05-02"
            description="Finding balance"
            image="/placeholder.svg?height=300&width=300&text=Reflection"
          />
          <NFTCard
            title="Community Badge"
            description="For helping others"
            image="/placeholder.svg?height=300&width=300&text=Badge"
          />
        </div>
      )}
    </div>
  )
}

function NFTCard({
  title,
  description,
  image,
}: {
  title: string
  description: string
  image: string
}) {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-square relative">
        <img src={image || "/placeholder.svg"} alt={title} className="object-cover w-full h-full" />
      </div>
      <CardContent className="p-4">
        <h3 className="font-medium text-lg">{title}</h3>
        <p className="text-muted-foreground text-sm">{description}</p>
      </CardContent>
    </Card>
  )
}
