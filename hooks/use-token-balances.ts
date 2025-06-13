"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@/providers/wallet-provider"

interface TokenBalance {
  balance: string
  symbol: string
  name: string
  decimals: number
}

interface TokenBalances {
  gct: string
  care: string
}

export function useTokenBalances() {
  const { address, isConnected, isCorrectChain } = useWallet()
  const [balances, setBalances] = useState<TokenBalances>({
    gct: "0",
    care: "0",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (address && isConnected && isCorrectChain) {
      loadBalances()
    }
  }, [address, isConnected, isCorrectChain])

  const loadBalances = async () => {
    if (!address) return

    setIsLoading(true)
    setError(null)

    try {
      // Mock token balances for demo
      const mockBalances = {
        gct: "1000.0",
        care: "500.0",
      }

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setBalances(mockBalances)
    } catch (err: any) {
      setError(err.message || "Failed to load balances")
      console.error("Error loading token balances:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshBalances = () => {
    if (address && isConnected && isCorrectChain) {
      loadBalances()
    }
  }

  return {
    balances,
    isLoading,
    error,
    refetch: refreshBalances,
  }
}
