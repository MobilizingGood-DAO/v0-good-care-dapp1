"use client"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useWallet } from "@/providers/wallet-provider"
import { useTokenBalances } from "@/hooks/use-token-balances"
import { CHAIN_CONFIG, switchToGoodCareNetwork } from "@/lib/blockchain-config"
import { Wallet, Copy, ExternalLink, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function WalletInfo() {
  const { address, isConnected, connectWallet, isCorrectChain } = useWallet()
  const { balances, isLoading, refetch } = useTokenBalances()
  const { toast } = useToast()
  const [copying, setCopying] = useState(false)

  const copyAddress = async () => {
    if (!address) return

    setCopying(true)
    try {
      await navigator.clipboard.writeText(address)
      toast({
        title: "Address copied!",
        description: "Wallet address copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy address to clipboard",
        variant: "destructive",
      })
    }
    setCopying(false)
  }

  const handleNetworkSwitch = async () => {
    const success = await switchToGoodCareNetwork()
    if (success) {
      toast({
        title: "Network switched!",
        description: "Connected to GOOD CARE Network",
      })
    } else {
      toast({
        title: "Network switch failed",
        description: "Could not switch to GOOD CARE Network",
        variant: "destructive",
      })
    }
  }

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet
          </CardTitle>
          <CardDescription>Connect your wallet to view balances and send tokens</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={connectWallet} className="w-full">
            <Wallet className="mr-2 h-4 w-4" />
            Connect Wallet
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Wallet Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet Information
          </CardTitle>
          <CardDescription>Your connected wallet details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Address</p>
              <p className="text-sm text-muted-foreground font-mono">
                {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Not connected"}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyAddress} disabled={copying}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a
                  href={`${CHAIN_CONFIG.blockExplorerUrls[0]}/address/${address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Network</p>
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">{CHAIN_CONFIG.chainName}</p>
                <Badge variant={isCorrectChain ? "default" : "destructive"}>
                  {isCorrectChain ? "Connected" : "Wrong Network"}
                </Badge>
              </div>
            </div>
            {!isCorrectChain && (
              <Button variant="outline" size="sm" onClick={handleNetworkSwitch}>
                Switch Network
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Token Balances */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Token Balances</span>
            <Button variant="outline" size="sm" onClick={refetch} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </CardTitle>
          <CardDescription>Your GOOD CARE ecosystem tokens</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold text-sm">C</span>
                </div>
                <div>
                  <p className="font-medium">CARE</p>
                  <p className="text-sm text-muted-foreground">Native Token</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">{balances.care} CARE</p>
                <p className="text-sm text-muted-foreground">
                  ≈ ${(Number.parseFloat(balances.care) * 0.1).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">G</span>
                </div>
                <div>
                  <p className="font-medium">GCT</p>
                  <p className="text-sm text-muted-foreground">GOOD CARE Token</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">{balances.gct} GCT</p>
                <p className="text-sm text-muted-foreground">
                  ≈ ${(Number.parseFloat(balances.gct) * 0.05).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
