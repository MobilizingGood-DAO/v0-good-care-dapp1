"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { CHAIN_CONFIG } from "@/lib/blockchain-config"
import { useToast } from "@/hooks/use-toast"

interface WalletContextType {
  address: string | null
  isConnected: boolean
  isCorrectChain: boolean
  chainId: number | null
  connectWallet: () => Promise<void>
  switchNetwork: () => Promise<boolean>
  disconnect: () => void
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isCorrectChain, setIsCorrectChain] = useState(false)
  const [chainId, setChainId] = useState<number | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    checkConnection()

    // Listen for account changes
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged)
      window.ethereum.on("chainChanged", handleChainChanged)
    }

    return () => {
      if (typeof window !== "undefined" && window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
        window.ethereum.removeListener("chainChanged", handleChainChanged)
      }
    }
  }, [])

  const checkConnection = async () => {
    try {
      if (typeof window !== "undefined" && window.ethereum) {
        const accounts = await window.ethereum.request({ method: "eth_accounts" })
        if (accounts.length > 0) {
          setAddress(accounts[0])
          setIsConnected(true)
          await checkChain()
        }
      }
    } catch (error) {
      console.error("Error checking wallet connection:", error)
    }
  }

  const checkChain = async () => {
    try {
      if (typeof window !== "undefined" && window.ethereum) {
        const chainIdHex = await window.ethereum.request({ method: "eth_chainId" })
        const currentChainId = Number.parseInt(chainIdHex, 16)
        setChainId(currentChainId)
        setIsCorrectChain(currentChainId === CHAIN_CONFIG.chainId)
      }
    } catch (error) {
      console.error("Error checking chain:", error)
    }
  }

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length > 0) {
      setAddress(accounts[0])
      setIsConnected(true)
    } else {
      setAddress(null)
      setIsConnected(false)
    }
  }

  const handleChainChanged = (chainIdHex: string) => {
    const currentChainId = Number.parseInt(chainIdHex, 16)
    setChainId(currentChainId)
    setIsCorrectChain(currentChainId === CHAIN_CONFIG.chainId)
  }

  const connectWallet = async () => {
    try {
      if (typeof window === "undefined" || !window.ethereum) {
        // Create a demo wallet address for users without MetaMask
        const demoAddress = `0x${crypto.randomUUID().replace(/-/g, "").slice(0, 40)}`
        setAddress(demoAddress)
        setIsConnected(true)
        setIsCorrectChain(true)
        setChainId(CHAIN_CONFIG.chainId)

        toast({
          title: "Demo Wallet Connected",
          description: "Using demo wallet for testing purposes",
        })
        return
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      if (accounts.length > 0) {
        setAddress(accounts[0])
        setIsConnected(true)
        await checkChain()

        toast({
          title: "Wallet Connected",
          description: `Connected to ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
        })
      }
    } catch (error: any) {
      console.error("Error connecting wallet:", error)
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive",
      })
    }
  }

  const switchNetwork = async (): Promise<boolean> => {
    try {
      if (typeof window === "undefined" || !window.ethereum) {
        // For demo mode, just set as correct chain
        setIsCorrectChain(true)
        setChainId(CHAIN_CONFIG.chainId)
        return true
      }

      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: CHAIN_CONFIG.chainIdHex }],
      })

      setIsCorrectChain(true)
      setChainId(CHAIN_CONFIG.chainId)
      toast({
        title: "Network Switched",
        description: "Successfully switched to GOOD CARE Network",
      })
      return true
    } catch (error: any) {
      if (error.code === 4902) {
        // Chain not added to wallet, try to add it
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [CHAIN_CONFIG],
          })
          setIsCorrectChain(true)
          setChainId(CHAIN_CONFIG.chainId)
          return true
        } catch (addError) {
          console.error("Error adding chain:", addError)
        }
      }

      toast({
        title: "Network Switch Failed",
        description: error.message || "Failed to switch network",
        variant: "destructive",
      })
      return false
    }
  }

  const disconnect = () => {
    setAddress(null)
    setIsConnected(false)
    setIsCorrectChain(false)
    setChainId(null)

    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    })
  }

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnected,
        isCorrectChain,
        chainId,
        connectWallet,
        switchNetwork,
        disconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}
