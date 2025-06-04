"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@/providers/wallet-provider"
import { fetchTokenBalances } from "@/lib/blockchain"

export function useTokenBalances() {
  const { address, isConnected, isCorrectChain } = useWallet()
  const [balances, setBalances] = useState({
    gct: { balance: "0", symbol: "GCT", name: "GCT Token", decimals: 18 },
    care: { balance: "0", symbol: "CARE", name: "CARE Token", decimals: 18 },
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function getBalances() {
      if (!address || !isConnected || !isCorrectChain) return

      setIsLoading(true)
      setError(null)

      try {
        const tokenBalances = await fetchTokenBalances(address)
        setBalances(tokenBalances)
      } catch (err) {
        console.error("Error fetching token balances:", err)
        setError("Failed to fetch token balances")
      } finally {
        setIsLoading(false)
      }
    }

    getBalances()

    // Set up polling for balance updates
    const intervalId = setInterval(getBalances, 30000) // Every 30 seconds

    return () => clearInterval(intervalId)
  }, [address, isConnected, isCorrectChain])

  return { balances, isLoading, error }
}
