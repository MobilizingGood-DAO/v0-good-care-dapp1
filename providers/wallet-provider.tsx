"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { fetchTokenBalances } from "@/lib/blockchain"

interface WalletContextType {
  address: string | null
  balance: {
    gct: string
    care: string
  }
  isConnected: boolean
  connect: () => Promise<void>
  disconnect: () => void
}

const defaultContext: WalletContextType = {
  address: null,
  balance: {
    gct: "0",
    care: "0",
  },
  isConnected: false,
  connect: async () => {},
  disconnect: () => {},
}

const WalletContext = createContext<WalletContextType>(defaultContext)

export const useWallet = () => {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)
  const [balance, setBalance] = useState<{ gct: string; care: string }>({
    gct: "0",
    care: "0",
  })
  const [isConnected, setIsConnected] = useState(false)

  // Load wallet from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return

    try {
      const savedAddress = localStorage.getItem("walletAddress")
      if (savedAddress) {
        setAddress(savedAddress)
        setIsConnected(true)

        // Fetch balances
        fetchTokenBalances(savedAddress).then((balances) => {
          setBalance({
            gct: balances.gct.balance,
            care: balances.care.balance,
          })
        })
      }
    } catch (error) {
      console.error("Error loading wallet from localStorage:", error)
    }
  }, [])

  const connect = async () => {
    try {
      // Generate a mock wallet address
      const mockAddress = `0x${Array(40)
        .fill(0)
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join("")}`

      setAddress(mockAddress)
      setIsConnected(true)

      // Save to localStorage
      localStorage.setItem("walletAddress", mockAddress)

      // Fetch mock balances
      const balances = await fetchTokenBalances(mockAddress)
      setBalance({
        gct: balances.gct.balance,
        care: balances.care.balance,
      })
    } catch (error) {
      console.error("Error connecting wallet:", error)
    }
  }

  const disconnect = () => {
    setAddress(null)
    setIsConnected(false)
    setBalance({ gct: "0", care: "0" })

    // Remove from localStorage
    localStorage.removeItem("walletAddress")
  }

  return (
    <WalletContext.Provider
      value={{
        address,
        balance,
        isConnected,
        connect,
        disconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}
