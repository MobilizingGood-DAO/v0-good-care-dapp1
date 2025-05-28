"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { CHAIN_CONFIG, switchToGoodCareNetwork } from "@/lib/blockchain-config"
import { createOrGetUserByEmail, createOrGetUserBySocial, createSession } from "@/lib/auth-service"

// Define types for our context
type WalletContextType = {
  address: string | null
  balance: string
  isConnected: boolean
  isCorrectChain: boolean
  isLoading: boolean
  walletType: "metamask" | "avacloud" | null
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  switchNetwork: () => Promise<boolean>
  setAvaCloudWallet: (address: string, email?: string, socialProvider?: string, socialId?: string) => void
}

// Create context with default values
const WalletContext = createContext<WalletContextType>({
  address: null,
  balance: "0",
  isConnected: false,
  isCorrectChain: false,
  isLoading: false,
  walletType: null,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  switchNetwork: async () => false,
  setAvaCloudWallet: () => {},
})

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)
  const [balance, setBalance] = useState("0")
  const [isConnected, setIsConnected] = useState(false)
  const [isCorrectChain, setIsCorrectChain] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [walletType, setWalletType] = useState<"metamask" | "avacloud" | null>(null)

  // Check if wallet is already connected on mount
  useEffect(() => {
    checkConnection()

    // Listen for account changes (only for MetaMask)
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

  // Check if wallet is connected and on the correct chain
  const checkConnection = async () => {
    // First check for AvaCloud wallet in localStorage
    const avaCloudWallet = localStorage.getItem("avacloud_wallet_address")
    if (avaCloudWallet) {
      setAddress(avaCloudWallet)
      setIsConnected(true)
      setIsCorrectChain(true) // AvaCloud wallets are always on the correct chain
      setWalletType("avacloud")
      await updateBalance(avaCloudWallet)
      return
    }

    // Then check for MetaMask
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        // Get connected accounts
        const accounts = await window.ethereum.request({ method: "eth_accounts" })

        if (accounts.length > 0) {
          setAddress(accounts[0])
          setIsConnected(true)
          setWalletType("metamask")

          // Check if on the correct chain
          const chainId = await window.ethereum.request({ method: "eth_chainId" })
          setIsCorrectChain(Number.parseInt(chainId, 16) === CHAIN_CONFIG.chainId)

          // Get balance
          await updateBalance(accounts[0])
        }
      } catch (error) {
        console.error("Error checking connection:", error)
      }
    }
  }

  // Handle account changes (MetaMask only)
  const handleAccountsChanged = (accounts: string[]) => {
    if (walletType === "avacloud") return // Don't handle MetaMask events for AvaCloud wallets

    if (accounts.length === 0) {
      // User disconnected
      disconnectWallet()
    } else {
      setAddress(accounts[0])
      setIsConnected(true)
      updateBalance(accounts[0])
    }
  }

  // Handle chain changes (MetaMask only)
  const handleChainChanged = (chainId: string) => {
    if (walletType === "avacloud") return // Don't handle MetaMask events for AvaCloud wallets

    setIsCorrectChain(Number.parseInt(chainId, 16) === CHAIN_CONFIG.chainId)

    // Reload the page on chain change as recommended by MetaMask
    window.location.reload()
  }

  // Set AvaCloud wallet (called after successful registration/login)
  const setAvaCloudWallet = async (
    walletAddress: string,
    email?: string,
    socialProvider?: string,
    socialId?: string,
  ) => {
    setAddress(walletAddress)
    setIsConnected(true)
    setIsCorrectChain(true) // AvaCloud wallets are always on the correct chain
    setWalletType("avacloud")

    // Store in localStorage for persistence
    localStorage.setItem("avacloud_wallet_address", walletAddress)
    localStorage.setItem("wallet_type", "avacloud")

    // Create or get user and session
    try {
      let user
      if (email) {
        user = await createOrGetUserByEmail(email, walletAddress)
      } else if (socialProvider && socialId) {
        user = await createOrGetUserBySocial(socialProvider, socialId, email, walletAddress)
      }

      if (user) {
        const session = await createSession(user)
        localStorage.setItem("auth_token", session.accessToken)
      }
    } catch (error) {
      console.error("Error creating user session:", error)
      // Don't fail wallet connection if auth fails
    }

    // Update balance
    updateBalance(walletAddress)
  }

  // Update wallet balance
  const updateBalance = async (walletAddress: string) => {
    if (walletType === "avacloud") {
      // For AvaCloud wallets, we'll use mock data for now
      // In a real implementation, this would call the AvaCloud API
      setBalance("100.00")
      return
    }

    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const balance = await window.ethereum.request({
          method: "eth_getBalance",
          params: [walletAddress, "latest"],
        })

        // Convert from wei to GOOD
        const goodBalance = Number.parseInt(balance, 16) / 1e18
        setBalance(goodBalance.toFixed(2))
      } catch (error) {
        console.error("Error getting balance:", error)
      }
    }
  }

  // Connect wallet (MetaMask)
  const connectWallet = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      setIsLoading(true)

      try {
        // Request accounts
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })

        if (accounts.length > 0) {
          setAddress(accounts[0])
          setIsConnected(true)
          setWalletType("metamask")

          // Check if on the correct chain
          const chainId = await window.ethereum.request({ method: "eth_chainId" })
          const isCorrect = Number.parseInt(chainId, 16) === CHAIN_CONFIG.chainId
          setIsCorrectChain(isCorrect)

          // If not on the correct chain, try to switch
          if (!isCorrect) {
            await switchToGoodCareNetwork()
          }

          // Get balance
          await updateBalance(accounts[0])
        }
      } catch (error) {
        console.error("Error connecting wallet:", error)
      } finally {
        setIsLoading(false)
      }
    } else {
      alert("Please install MetaMask or another Ethereum wallet to use this feature.")
    }
  }

  // Disconnect wallet
  const disconnectWallet = () => {
    setAddress(null)
    setBalance("0")
    setIsConnected(false)
    setWalletType(null)

    // Clear localStorage
    localStorage.removeItem("avacloud_wallet_address")
    localStorage.removeItem("wallet_type")
  }

  // Switch to the GOOD CARE Network (MetaMask only)
  const switchNetwork = async () => {
    if (walletType === "avacloud") return true // AvaCloud wallets are always on the correct chain

    const success = await switchToGoodCareNetwork()
    if (success) {
      setIsCorrectChain(true)
    }
    return success
  }

  const value = {
    address,
    balance,
    isConnected,
    isCorrectChain,
    isLoading,
    walletType,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    setAvaCloudWallet,
  }

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

// Custom hook to use the wallet context
export const useWallet = () => useContext(WalletContext)

// Add TypeScript declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean
      request: (request: { method: string; params?: any[] }) => Promise<any>
      on: (event: string, listener: (...args: any[]) => void) => void
      removeListener: (event: string, listener: (...args: any[]) => void) => void
    }
  }
}
