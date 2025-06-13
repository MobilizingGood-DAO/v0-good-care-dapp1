"use client"

import { useState, useEffect } from "react"

export function useTokenBalance(address?: string) {
  const [balance, setBalance] = useState("0")
  const [symbol, setSymbol] = useState("CARE")
  const [name, setName] = useState("CARE Token")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!address) return

    setIsLoading(true)
    setError(null)

    // Mock balance for demo
    setTimeout(() => {
      setBalance((Math.random() * 1000).toFixed(2))
      setSymbol("CARE")
      setName("CARE Token")
      setIsLoading(false)
    }, 1000)
  }, [address])

  return { balance, symbol, name, isLoading, error }
}
