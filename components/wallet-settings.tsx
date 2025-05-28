"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, ExternalLink } from "lucide-react"
import { useWallet } from "@/providers/wallet-provider"
import { CHAIN_CONFIG } from "@/lib/blockchain-config"

export function WalletSettings() {
  const { isConnected, isCorrectChain, connectWallet, switchNetwork } = useWallet()
  const [isLoading, setIsLoading] = useState(false)
  const [showBackupAlert, setShowBackupAlert] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
    }, 2000)
  }

  const handleBackupWallet = () => {
    setShowBackupAlert(true)
  }

  if (!isConnected) {
    return (
      <div className="text-center py-6">
        <p className="mb-4">Connect your wallet to access wallet settings</p>
        <Button onClick={connectWallet} className="bg-green-600 hover:bg-green-700">
          Connect Wallet
        </Button>
      </div>
    )
  }

  if (!isCorrectChain) {
    return (
      <div className="text-center py-6">
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please switch to the GOOD CARE Network (Chain ID: {CHAIN_CONFIG.chainId}) to access wallet settings
          </AlertDescription>
        </Alert>
        <Button onClick={switchNetwork} className="bg-green-600 hover:bg-green-700">
          Switch Network
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {showBackupAlert && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This is a demo. In a real application, this would generate a recovery phrase or private key that you should
            store securely.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="p-4 border rounded-md">
          <h3 className="font-medium mb-2">Network Information</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-muted-foreground">Network Name:</div>
            <div>{CHAIN_CONFIG.chainName}</div>

            <div className="text-muted-foreground">Chain ID:</div>
            <div>{CHAIN_CONFIG.chainId}</div>

            <div className="text-muted-foreground">Currency:</div>
            <div>
              {CHAIN_CONFIG.nativeCurrency.name} ({CHAIN_CONFIG.nativeCurrency.symbol})
            </div>

            <div className="text-muted-foreground">RPC URL:</div>
            <div className="truncate">{CHAIN_CONFIG.rpcUrls[0]}</div>

            <div className="text-muted-foreground">Block Explorer:</div>
            <div className="flex items-center">
              <a
                href={CHAIN_CONFIG.blockExplorerUrls[0]}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:underline flex items-center"
              >
                View Explorer <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="gas-limit">Default Gas Limit</Label>
          <Input id="gas-limit" type="number" defaultValue="21000" />
          <p className="text-xs text-muted-foreground">The default gas limit for transactions</p>
        </div>

        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="auto-sign" className="flex flex-col space-y-1">
            <span>Auto-sign Transactions</span>
            <span className="font-normal text-sm text-muted-foreground">
              Automatically sign transactions under a certain value
            </span>
          </Label>
          <Switch id="auto-sign" />
        </div>

        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="transaction-notifications" className="flex flex-col space-y-1">
            <span>Transaction Notifications</span>
            <span className="font-normal text-sm text-muted-foreground">
              Receive notifications for all transactions
            </span>
          </Label>
          <Switch id="transaction-notifications" defaultChecked />
        </div>
      </div>

      <div className="space-y-2">
        <Button type="button" variant="outline" className="w-full" onClick={handleBackupWallet}>
          Backup Wallet
        </Button>
        <p className="text-xs text-muted-foreground text-center">Generate a recovery phrase to backup your wallet</p>
      </div>

      <Button type="submit" className="w-full sm:w-auto bg-green-600 hover:bg-green-700" disabled={isLoading}>
        {isLoading ? "Saving..." : "Save Settings"}
      </Button>
    </form>
  )
}
