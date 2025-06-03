"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@/providers/wallet-provider"
import { fetchTokenBalances, type TokenBalance } from "@/lib/blockchain"

interface TokenBalances {
  gct: TokenBalance
  care: TokenBalance
}

export function useTokenBalances() {
  const { address, isConnected, isCorrectChain } = useWallet()
  const [balances, setBalances] = useState<TokenBalances>({
    gct: { balance: "0", symbol: "GCT", name: "GOOD CARE Token", decimals: 18 },
    care: { balance: "0", symbol: "CARE", name: "CARE Token", decimals: 18 },
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
      const tokenBalances = await fetchTokenBalances(address)
      setBalances(tokenBalances)
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
    refreshBalances,
  }
}
