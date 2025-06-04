"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, Check, Eye, EyeOff, AlertTriangle, Loader2 } from "lucide-react"
import { useWallet } from "@/providers/wallet-provider"
import { CHAIN_CONFIG } from "@/lib/blockchain-config"
import { useTokenBalances } from "@/hooks/use-token-balances"

export function WalletInfo() {
  const [copied, setCopied] = useState(false)
  const [showAddress, setShowAddress] = useState(false)
  const { address, isConnected, isCorrectChain, connectWallet, switchNetwork } = useWallet()
  const { balances, isLoading, error } = useTokenBalances()

  const displayAddress = address
    ? showAddress
      ? address
      : address.substring(0, 6) + "..." + address.substring(address.length - 4)
    : "Not connected"

  const copyToClipboard = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wallet Details</CardTitle>
        <CardDescription>Your CARE Card wallet information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConnected ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Connect your wallet to view your balance and details.</p>
            <Button onClick={connectWallet} className="w-full bg-green-600 hover:bg-green-700">
              Connect Wallet
            </Button>
          </div>
        ) : (
          <>
            {!isCorrectChain && (
              <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md mb-4">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <div className="flex-1 text-sm">
                  <p>You're not connected to the GOOD CARE Network (Chain ID: {CHAIN_CONFIG.chainId})</p>
                </div>
                <Button size="sm" onClick={switchNetwork}>
                  Switch Network
                </Button>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="text-sm font-medium">GCT Balance</div>
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading...</span>
                  </div>
                ) : error ? (
                  <div className="text-sm text-red-500">{error}</div>
                ) : (
                  <div className="text-2xl font-bold">
                    {balances.gct.balance} {balances.gct.symbol}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">CARE Balance</div>
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading...</span>
                  </div>
                ) : error ? (
                  <div className="text-sm text-red-500">{error}</div>
                ) : (
                  <div className="text-2xl font-bold">
                    {balances.care.balance} {balances.care.symbol}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Wallet Address</div>
              <div className="flex items-center space-x-2">
                <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                  {displayAddress}
                </code>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowAddress(!showAddress)}>
                  {showAddress ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={copyToClipboard} disabled={!address}>
                  {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Network</div>
              <div className="flex items-center space-x-2">
                <div className={`h-2 w-2 rounded-full ${isCorrectChain ? "bg-green-600" : "bg-yellow-500"}`}></div>
                <span>{isCorrectChain ? "GOOD CARE Network" : "Wrong Network"}</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
