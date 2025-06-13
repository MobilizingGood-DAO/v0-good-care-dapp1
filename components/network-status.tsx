"use client"

import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { useWallet } from "@/providers/wallet-provider"
import { CHAIN_CONFIG } from "@/lib/blockchain-config"

export function NetworkStatus() {
  const { isConnected, isCorrectChain, connectWallet, switchNetwork } = useWallet()

  if (!isConnected) {
    return (
      <Alert className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Wallet Not Connected</AlertTitle>
        <AlertDescription className="flex justify-between items-center">
          <span>Connect your wallet to interact with the GOOD CARE Network</span>
          <Button size="sm" onClick={connectWallet} className="bg-green-600 hover:bg-green-700">
            Connect Wallet
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (!isCorrectChain) {
    return (
      <Alert className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Wrong Network</AlertTitle>
        <AlertDescription className="flex justify-between items-center">
          <span>Please switch to the GOOD CARE Network (Chain ID: {CHAIN_CONFIG.chainId})</span>
          <Button size="sm" onClick={switchNetwork} className="bg-green-600 hover:bg-green-700">
            Switch Network
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert className="mb-4 bg-green-50 border-green-600">
      <CheckCircle2 className="h-4 w-4 text-green-600" />
      <AlertTitle>Connected to GOOD CARE Network</AlertTitle>
      <AlertDescription>
        You are successfully connected to the GOOD CARE Network (Chain ID: {CHAIN_CONFIG.chainId})
      </AlertDescription>
    </Alert>
  )
}
