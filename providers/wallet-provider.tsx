"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { providers } from "@/lib/mock-ethers"

interface WalletContextType {
  signer: providers.JsonRpcSigner | null
  address: string | null
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  isConnected: boolean
}

const WalletContext = createContext<WalletContextType>({
  signer: null,
  address: null,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  isConnected: false,
})

interface WalletProviderProps {
  children: ReactNode
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [signer, setSigner] = useState<providers.JsonRpcSigner | null>(null)
  const [address, setAddress] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState<boolean>(false)

  useEffect(() => {
    const storedAddress = localStorage.getItem("walletAddress")
    if (storedAddress) {
      connectWithStoredAddress(storedAddress)
    }
  }, [])

  const connectWallet = async () => {
    try {
      const provider = new providers.Web3Provider(window.ethereum as any)
      await provider.send("eth_requestAccounts", [])
      const signer = provider.getSigner()
      const address = await signer.getAddress()

      setSigner(signer)
      setAddress(address)
      setIsConnected(true)

      localStorage.setItem("walletAddress", address)
    } catch (error) {
      console.error("Error connecting wallet:", error)
    }
  }

  const connectWithStoredAddress = async (storedAddress: string) => {
    try {
      const provider = new providers.Web3Provider(window.ethereum as any)
      const signer = provider.getSigner(storedAddress)
      setSigner(signer)
      setAddress(storedAddress)
      setIsConnected(true)
    } catch (error) {
      console.error("Error connecting with stored address:", error)
      localStorage.removeItem("walletAddress")
    }
  }

  const disconnectWallet = () => {
    setSigner(null)
    setAddress(null)
    setIsConnected(false)
    localStorage.removeItem("walletAddress")
  }

  return (
    <WalletContext.Provider value={{ signer, address, connectWallet, disconnectWallet, isConnected }}>
      {children}
    </WalletContext.Provider>
  )
}

export const useWallet = () => useContext(WalletContext)
