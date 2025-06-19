"use client"

import dynamic from "next/dynamic"
import type React from "react"

// Dynamically import WalletProvider with no SSR
const WalletProvider = dynamic(() => import("./wallet-provider").then((mod) => ({ default: mod.WalletProvider })), {
  ssr: false,
  loading: () => <div>Loading wallet...</div>,
})

interface ClientWalletProviderProps {
  children: React.ReactNode
}

export function ClientWalletProvider({ children }: ClientWalletProviderProps) {
  return <WalletProvider>{children}</WalletProvider>
}

export default ClientWalletProvider
