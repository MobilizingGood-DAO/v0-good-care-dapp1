"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Wallet, Mail, Github, Twitter } from "lucide-react"

interface WalletConnectProps {
  onConnect?: (address: string) => void
  onError?: (error: string) => void
  className?: string
}

export function WalletConnect({ onConnect, onError, className }: WalletConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConnect = async (method: "email" | "social" | "wallet") => {
    setIsConnecting(true)
    setError(null)

    try {
      if (method === "wallet") {
        // For external wallet connection (MetaMask, etc.)
        if (typeof window !== "undefined" && window.ethereum) {
          const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
          if (accounts.length > 0) {
            onConnect?.(accounts[0])
          }
        }
      } else {
        // For AvaCloud wallets, simulate connection
        await new Promise((resolve) => setTimeout(resolve, 2000))

        const mockAddress = `0x${Array(40)
          .fill(0)
          .map(() => Math.floor(Math.random() * 16).toString(16))
          .join("")}`

        onConnect?.(mockAddress)
      }
    } catch (err) {
      const errorMessage = "Failed to connect wallet"
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Wallet className="h-5 w-5" />
          <span>Connect Your Wallet</span>
        </CardTitle>
        <CardDescription>Choose your preferred method to connect to the GOOD CARE Network</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          <Button
            onClick={() => handleConnect("email")}
            disabled={isConnecting}
            className="w-full justify-start"
            variant="outline"
          >
            {isConnecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
            Connect with Email
          </Button>

          <Button
            onClick={() => handleConnect("social")}
            disabled={isConnecting}
            className="w-full justify-start"
            variant="outline"
          >
            {isConnecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Github className="mr-2 h-4 w-4" />}
            Connect with GitHub
          </Button>

          <Button
            onClick={() => handleConnect("social")}
            disabled={isConnecting}
            className="w-full justify-start"
            variant="outline"
          >
            {isConnecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Twitter className="mr-2 h-4 w-4" />}
            Connect with Twitter
          </Button>

          <Button
            onClick={() => handleConnect("wallet")}
            disabled={isConnecting}
            className="w-full justify-start bg-green-600 hover:bg-green-700"
          >
            {isConnecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wallet className="mr-2 h-4 w-4" />}
            Connect External Wallet
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
