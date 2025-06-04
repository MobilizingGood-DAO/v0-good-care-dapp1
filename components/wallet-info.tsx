"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { useWallet } from "@/providers/wallet-provider"

export function WalletInfo() {
  const { address, balance, isConnected, connect, disconnect } = useWallet()
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    if (!address) return

    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy address", err)
    }
  }

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Wallet</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-6">
          <p className="text-muted-foreground mb-4">Connect your wallet to view your balance</p>
          <Button onClick={connect}>Connect Wallet</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wallet</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-1">Address</div>
            <div className="flex items-center gap-2">
              <div className="bg-muted p-2 rounded text-xs font-mono overflow-x-auto whitespace-nowrap max-w-full">
                {address}
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={copyToClipboard}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">GCT Balance</div>
              <div className="text-2xl font-bold">{balance.gct}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">CARE Balance</div>
              <div className="text-2xl font-bold">{balance.care}</div>
            </div>
          </div>

          <Button variant="outline" onClick={disconnect} className="w-full">
            Disconnect
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
