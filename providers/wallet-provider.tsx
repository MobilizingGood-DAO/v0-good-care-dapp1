"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { ethers } from "ethers"
import { CHAIN_CONFIG } from "@/lib/blockchain-config"

interface WalletContextType {
  account: string | null
  isConnected: boolean
  isConnecting: boolean
  balance: string
  connect: () => Promise<void>
  disconnect: () => void
  switchNetwork: () => Promise<void>
  sendTransaction: (to: string, amount: string) => Promise<string>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}

interface WalletProviderProps {
  children: ReactNode
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [account, setAccount] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [balance, setBalance] = useState("0.0")

  useEffect(() => {
    checkConnection()

    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged)
      window.ethereum.on("chainChanged", handleChainChanged)

      return () => {
        window.ethereum?.removeListener("accountsChanged", handleAccountsChanged)
        window.ethereum?.removeListener("chainChanged", handleChainChanged)
      }
    }
  }, [])

  const checkConnection = async () => {
    try {
      if (typeof window !== "undefined" && window.ethereum) {
        const accounts = await window.ethereum.request({ method: "eth_accounts" })
        if (accounts.length > 0) {
          setAccount(accounts[0])
          setIsConnected(true)
          await updateBalance(accounts[0])
        }
      }
    } catch (error) {
      console.error("Error checking connection:", error)
    }
  }

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnect()
    } else {
      setAccount(accounts[0])
      updateBalance(accounts[0])
    }
  }

  const handleChainChanged = () => {
    window.location.reload()
  }

  const updateBalance = async (address: string) => {
    try {
      if (typeof window !== "undefined" && window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const balance = await provider.getBalance(address)
        setBalance(ethers.formatEther(balance))
      }
    } catch (error) {
      console.error("Error updating balance:", error)
    }
  }

  const connect = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      alert("Please install MetaMask or another Web3 wallet")
      return
    }

    setIsConnecting(true)

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      if (accounts.length > 0) {
        setAccount(accounts[0])
        setIsConnected(true)
        await updateBalance(accounts[0])

        // Try to switch to GOOD CARE network
        await switchNetwork()
      }
    } catch (error: any) {
      console.error("Error connecting wallet:", error)
      if (error.code === 4001) {
        alert("Please connect your wallet to continue")
      } else {
        alert("Failed to connect wallet. Please try again.")
      }
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnect = () => {
    setAccount(null)
    setIsConnected(false)
    setBalance("0.0")
  }

  const switchNetwork = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      throw new Error("No wallet found")
    }

    try {
      // Try to switch to the GOOD CARE network
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: CHAIN_CONFIG.chainId }],
      })
    } catch (switchError: any) {
      // If the network doesn't exist, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [CHAIN_CONFIG],
          })
        } catch (addError) {
          console.error("Error adding network:", addError)
          throw new Error("Failed to add GOOD CARE network")
        }
      } else {
        console.error("Error switching network:", switchError)
        throw new Error("Failed to switch to GOOD CARE network")
      }
    }
  }

  const sendTransaction = async (to: string, amount: string): Promise<string> => {
    if (!account || typeof window === "undefined" || !window.ethereum) {
      throw new Error("Wallet not connected")
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()

      const tx = await signer.sendTransaction({
        to,
        value: ethers.parseEther(amount),
      })

      await tx.wait()
      await updateBalance(account)

      return tx.hash
    } catch (error) {
      console.error("Error sending transaction:", error)
      throw error
    }
  }

  const value: WalletContextType = {
    account,
    isConnected,
    isConnecting,
    balance,
    connect,
    disconnect,
    switchNetwork,
    sendTransaction,
  }

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}
