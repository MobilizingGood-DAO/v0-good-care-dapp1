"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, ExternalLink, RefreshCw, Send, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { BlockchainService, type TokenBalance } from "@/lib/blockchain-service"

interface EnhancedWalletProps {
  walletAddress: string
  privateKey?: string
}

export function EnhancedWallet({ walletAddress, privateKey }: EnhancedWalletProps) {
  const [careBalance, setCareBalance] = useState<TokenBalance | null>(null)
  const [gctBalance, setGctBalance] = useState<TokenBalance | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showPrivateKey, setShowPrivateKey] = useState(false)
  const { toast } = useToast()

  const blockchainService = new BlockchainService()

  useEffect(() => {
    loadBalances()
  }, [walletAddress])

  const loadBalances = async () => {
    setIsLoading(true)
    try {
      const [care, gct] = await Promise.all([
        blockchainService.getCareBalance(walletAddress),
        blockchainService.getGCTBalance(walletAddress),
      ])
      setCareBalance(care)
      setGctBalance(gct)
    } catch (error) {
      console.error("Error loading balances:", error)
      toast({
        title: "Error loading balances",
        description: "Please try again later",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: `${label} copied!`,
        description: "Copied to clipboard",
      })
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea")
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)

      toast({
        title: `${label} copied!`,
        description: "Copied to clipboard",
      })
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const TokenCard = ({ balance, isLoading }: { balance: TokenBalance | null; isLoading: boolean }) => (
    <Card>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-20"></div>
          </div>
        ) : balance ? (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">{balance.symbol}</span>
              <Badge variant="outline" className="text-xs">
                {balance.name}
              </Badge>
            </div>
            <div className="text-2xl font-bold mb-1">{BlockchainService.formatBalance(balance.balance)}</div>
            {balance.usdValue && (
              <div className="text-sm text-muted-foreground">≈ {BlockchainService.formatUSD(balance.usdValue)}</div>
            )}
          </div>
        ) : (
          <div className="text-center text-muted-foreground">Failed to load balance</div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Wallet Address */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Wallet Address</span>
            <Button variant="outline" size="sm" onClick={loadBalances} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <code className="text-sm font-mono">{walletAddress}</code>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(walletAddress, "Address")}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(`https://subnets.avax.network/goodcare/address/${walletAddress}`, "_blank")}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Token Balances */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TokenCard balance={careBalance} isLoading={isLoading} />
        <TokenCard balance={gctBalance} isLoading={isLoading} />
      </div>

      {/* Private Key Management */}
      {privateKey && (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Private Key</CardTitle>
            <CardDescription>Keep your private key secure. Never share it with anyone.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                <code className="text-sm font-mono">{showPrivateKey ? privateKey : "•".repeat(64)}</code>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setShowPrivateKey(!showPrivateKey)}>
                    {showPrivateKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  {showPrivateKey && (
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(privateKey, "Private Key")}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="text-xs text-red-600 space-y-1">
                <p>⚠️ Never share your private key with anyone</p>
                <p>⚠️ Store it securely offline</p>
                <p>⚠️ Anyone with this key can access your funds</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Button className="h-12" disabled={!careBalance || Number.parseFloat(careBalance.balance) === 0}>
          <Send className="h-4 w-4 mr-2" />
          Send CARE
        </Button>
        <Button className="h-12" disabled={!gctBalance || Number.parseFloat(gctBalance.balance) === 0}>
          <Send className="h-4 w-4 mr-2" />
          Send GCT
        </Button>
      </div>
    </div>
  )
}
