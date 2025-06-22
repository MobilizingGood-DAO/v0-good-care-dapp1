"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAccount, useConnect, useDisconnect } from "wagmi"
import { Heart, Wallet, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import dynamic from "next/dynamic"

// Dynamically import the main app to avoid SSR issues
const GoodCareApp = dynamic(() => import("@/components/good-care-app"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🌱</div>
        <p className="text-muted-foreground">Loading GOOD CARE...</p>
      </div>
    </div>
  ),
})

export default function HomePage() {
  const { address, isConnected, isConnecting } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🌱</div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // If connected, show the main app
  if (isConnected && address) {
    return <GoodCareApp />
  }

  // Show login screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="text-6xl mb-4">🌱</div>
          <CardTitle className="text-2xl">Welcome to GOOD CARE</CardTitle>
          <CardDescription>
            Your daily wellness companion on the GOOD CARE Network. Connect your wallet to start your journey.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Benefits */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <Heart className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-sm">Daily Reflections</p>
                <p className="text-xs text-muted-foreground">Check in with your mood and feelings</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <Heart className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-sm">Earn CARE Points</p>
                <p className="text-xs text-muted-foreground">Build streaks and level up your wellness</p>
              </div>
            </div>
          </div>

          {/* Connect Wallet Buttons */}
          <div className="space-y-3">
            {connectors.map((connector) => (
              <Button
                key={connector.id}
                onClick={() => {
                  try {
                    connect({ connector })
                  } catch (error) {
                    console.error("Connection error:", error)
                    toast({
                      title: "Connection failed",
                      description: "Please try again",
                      variant: "destructive",
                    })
                  }
                }}
                disabled={isPending || isConnecting}
                variant="outline"
                className="w-full"
                size="lg"
              >
                {isPending || isConnecting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wallet className="mr-2 h-4 w-4" />
                )}
                Connect {connector.name}
              </Button>
            ))}
          </div>

          <div className="text-xs text-muted-foreground text-center">
            By connecting, you agree to join the GOOD CARE Network
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
