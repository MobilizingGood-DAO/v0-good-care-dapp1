"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAccount, useConnect, useDisconnect } from "wagmi"
import { Heart, Loader2, Globe, Shield } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import dynamic from "next/dynamic"

// Dynamically import the main app to avoid SSR issues
const GoodCareApp = dynamic(() => import("@/components/good-care-app"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-6xl mb-4 animate-pulse">🌱</div>
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
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">🌱</div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // If connected, show the main app
  if (isConnected && address) {
    return <GoodCareApp />
  }

  // Get wallet icons and names
  const getWalletInfo = (connectorId: string) => {
    switch (connectorId) {
      case "metaMask":
        return { name: "MetaMask", icon: "🦊", description: "Browser extension & mobile app" }
      case "coinbaseWalletSDK":
        return { name: "Core Wallet", icon: "⚡", description: "Avalanche's native wallet" }
      case "walletConnect":
        return { name: "WalletConnect", icon: "📱", description: "Connect any mobile wallet" }
      default:
        return { name: connectorId, icon: "🔗", description: "Connect wallet" }
    }
  }

  // Show mobile-friendly login screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex flex-col">
      {/* Header */}
      <div className="text-center pt-8 pb-4 px-4">
        <div className="text-6xl mb-4">🌱</div>
        <h1 className="text-3xl font-bold text-green-800 mb-2">GOOD CARE</h1>
        <p className="text-muted-foreground text-lg">Your daily wellness companion</p>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">Connect Your Wallet</CardTitle>
            <CardDescription className="text-sm">
              Choose your preferred wallet to start your wellness journey
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Wallet Connection Buttons */}
            <div className="space-y-3">
              {connectors.map((connector) => {
                const walletInfo = getWalletInfo(connector.id)
                return (
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
                    className="w-full h-16 flex items-center justify-start gap-4 text-left"
                    size="lg"
                  >
                    <div className="text-2xl">{walletInfo.icon}</div>
                    <div className="flex-1">
                      <div className="font-medium">{walletInfo.name}</div>
                      <div className="text-xs text-muted-foreground">{walletInfo.description}</div>
                    </div>
                    {(isPending || isConnecting) && <Loader2 className="h-4 w-4 animate-spin" />}
                  </Button>
                )
              })}
            </div>

            {/* Benefits Preview */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <Heart className="h-5 w-5 text-green-600 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">Daily Check-ins</p>
                  <p className="text-xs text-muted-foreground">Track your mood & earn CARE points</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Shield className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">Community Leaderboard</p>
                  <p className="text-xs text-muted-foreground">Compete with others in wellness</p>
                </div>
              </div>
            </div>

            {/* Network Info */}
            <div className="text-center pt-4 border-t">
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Globe className="h-3 w-3" />
                <span>GOOD CARE Network • Subnet 741741</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="text-center p-4 text-xs text-muted-foreground">
        <p>By connecting, you agree to join the GOOD CARE community</p>
      </div>
    </div>
  )
}
