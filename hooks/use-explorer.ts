"use client"

import { useState, useEffect } from "react"
import {
  fetchNetworkStats,
  fetchLatestBlocks,
  fetchLatestTransactions,
  fetchBlock,
  fetchTransaction,
  fetchAccount,
  search,
  type NetworkStats,
} from "@/lib/explorer-service"

export interface Block {
  number: number
  hash: string
  timestamp: number
  transactions: number
  gasUsed: string
  gasLimit: string
}

export interface Transaction {
  hash: string
  from: string
  to: string
  value: string
  gasPrice: string
  gasUsed: string
  timestamp: number
  status: "success" | "failed"
}

export interface Account {
  address: string
  balance: string
}

// Hook for network stats
export function useNetworkStats() {
  const [stats, setStats] = useState<NetworkStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function getStats() {
      try {
        setIsLoading(true)
        setError(null)
        const data = await fetchNetworkStats()
        setStats(data)
      } catch (err) {
        console.error("Error fetching network stats:", err)
        setError("Failed to fetch network statistics")
      } finally {
        setIsLoading(false)
      }
    }

    getStats()

    // Refresh every 15 seconds
    const intervalId = setInterval(getStats, 15000)
    return () => clearInterval(intervalId)
  }, [])

  return { stats, isLoading, error }
}

// Hook for latest blocks
export function useLatestBlocks(count = 10) {
  const [blocks, setBlocks] = useState<Block[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function getBlocks() {
      try {
        setIsLoading(true)
        setError(null)
        const data = await fetchLatestBlocks(count)
        setBlocks(data)
      } catch (err) {
        console.error("Error fetching latest blocks:", err)
        setError("Failed to fetch latest blocks")
      } finally {
        setIsLoading(false)
      }
    }

    getBlocks()

    // Refresh every 15 seconds
    const intervalId = setInterval(getBlocks, 15000)
    return () => clearInterval(intervalId)
  }, [count])

  return { blocks, isLoading, error }
}

// Hook for latest transactions
export function useLatestTransactions(count = 10) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function getTransactions() {
      try {
        setIsLoading(true)
        setError(null)
        const data = await fetchLatestTransactions(count)
        setTransactions(data)
      } catch (err) {
        console.error("Error fetching latest transactions:", err)
        setError("Failed to fetch latest transactions")
      } finally {
        setIsLoading(false)
      }
    }

    getTransactions()

    // Refresh every 15 seconds
    const intervalId = setInterval(getTransactions, 15000)
    return () => clearInterval(intervalId)
  }, [count])

  return { transactions, isLoading, error }
}

// Hook for block details
export function useBlock(blockHashOrNumber: string | number | null) {
  const [block, setBlock] = useState<Block | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function getBlock() {
      if (!blockHashOrNumber) {
        setBlock(null)
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        const data = await fetchBlock(blockHashOrNumber)
        setBlock(data)
      } catch (err) {
        console.error(`Error fetching block ${blockHashOrNumber}:`, err)
        setError("Failed to fetch block details")
      } finally {
        setIsLoading(false)
      }
    }

    getBlock()
  }, [blockHashOrNumber])

  return { block, isLoading, error }
}

// Hook for transaction details
export function useTransaction(txHash: string | null) {
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function getTransaction() {
      if (!txHash) {
        setTransaction(null)
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        const data = await fetchTransaction(txHash)
        setTransaction(data)
      } catch (err) {
        console.error(`Error fetching transaction ${txHash}:`, err)
        setError("Failed to fetch transaction details")
      } finally {
        setIsLoading(false)
      }
    }

    getTransaction()
  }, [txHash])

  return { transaction, isLoading, error }
}

// Hook for account details
export function useAccount(address: string | null) {
  const [account, setAccount] = useState<Account | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function getAccount() {
      if (!address) {
        setAccount(null)
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        const data = await fetchAccount(address)
        setAccount(data)
      } catch (err) {
        console.error(`Error fetching account ${address}:`, err)
        setError("Failed to fetch account details")
      } finally {
        setIsLoading(false)
      }
    }

    getAccount()
  }, [address])

  return { account, isLoading, error }
}

// Hook for search
export function useSearch() {
  const [query, setQuery] = useState("")
  const [result, setResult] = useState<any>(null)
  const [resultType, setResultType] = useState<"block" | "transaction" | "account" | "not_found" | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResult(null)
      setResultType(null)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      const { type, result } = await search(searchQuery)
      setResultType(type)
      setResult(result)
    } catch (err) {
      console.error(`Error searching for ${searchQuery}:`, err)
      setError("Failed to perform search")
      setResultType("not_found")
      setResult(null)
    } finally {
      setIsLoading(false)
    }
  }

  return { query, setQuery, performSearch, result, resultType, isLoading, error }
}

export function useExplorer() {
  const [latestBlocks, setLatestBlocks] = useState<Block[]>([])
  const [latestTransactions, setLatestTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data for demo
    const mockBlocks: Block[] = Array.from({ length: 10 }, (_, i) => ({
      number: 1000000 - i,
      hash: `0x${Math.random().toString(16).substring(2, 66)}`,
      timestamp: Date.now() - i * 15000,
      transactions: Math.floor(Math.random() * 100),
      gasUsed: (Math.random() * 8000000).toFixed(0),
      gasLimit: "8000000",
    }))

    const mockTransactions: Transaction[] = Array.from({ length: 10 }, (_, i) => ({
      hash: `0x${Math.random().toString(16).substring(2, 66)}`,
      from: `0x${Math.random().toString(16).substring(2, 42)}`,
      to: `0x${Math.random().toString(16).substring(2, 42)}`,
      value: (Math.random() * 10).toFixed(4),
      gasPrice: (Math.random() * 50).toFixed(0),
      gasUsed: (Math.random() * 21000).toFixed(0),
      timestamp: Date.now() - i * 30000,
      status: Math.random() > 0.1 ? "success" : "failed",
    }))

    setLatestBlocks(mockBlocks)
    setLatestTransactions(mockTransactions)
    setLoading(false)
  }, [])

  return {
    latestBlocks,
    latestTransactions,
    loading,
    getBlock: async (blockNumber: string) => null,
    getTransaction: async (txHash: string) => null,
    getAddress: async (address: string) => null,
  }
}
