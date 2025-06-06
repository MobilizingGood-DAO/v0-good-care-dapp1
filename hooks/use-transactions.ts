"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@/providers/wallet-provider"
import { fetchTransactionHistory } from "@/lib/blockchain"

export function useTransactions() {
  const { address, isConnected, isCorrectChain } = useWallet()
  const [transactions, setTransactions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function getTransactions() {
      if (!address || !isConnected || !isCorrectChain) return

      setIsLoading(true)
      setError(null)

      try {
        const txData = await fetchTransactionHistory(address)
        setTransactions(txData)
      } catch (err) {
        console.error("Error fetching transactions:", err)
        setError("Failed to fetch transactions")
      } finally {
        setIsLoading(false)
      }
    }

    getTransactions()

    // Set up polling for transaction updates
    const intervalId = setInterval(getTransactions, 60000) // Every minute

    return () => clearInterval(intervalId)
  }, [address, isConnected, isCorrectChain])

  return { transactions, isLoading, error }
}
