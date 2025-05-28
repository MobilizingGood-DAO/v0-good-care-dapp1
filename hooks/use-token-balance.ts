"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@/providers/wallet-provider"
import { fetchTokenBalance } from "@/lib/blockchain"

export function useTokenBalance() {
  const { address, isConnected, isCorrectChain } = useWallet()
  const [balance, setBalance] = useState("0")
  const [symbol, setSymbol] = useState("GOOD")
  const [name, setName] = useState("GOOD Token")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function getBalance() {
      if (!address || !isConnected || !isCorrectChain) return

      setIsLoading(true)
      setError(null)

      try {
        const tokenData = await fetchTokenBalance(address)
        setBalance(tokenData.balance)
        setSymbol(tokenData.symbol)
        setName(tokenData.name)
      } catch (err) {
        console.error("Error fetching token balance:", err)
        setError("Failed to fetch token balance")
      } finally {
        setIsLoading(false)
      }
    }

    getBalance()

    // Set up polling for balance updates
    const intervalId = setInterval(getBalance, 30000) // Every 30 seconds

    return () => clearInterval(intervalId)
  }, [address, isConnected, isCorrectChain])

  return { balance, symbol, name, isLoading, error }
}
