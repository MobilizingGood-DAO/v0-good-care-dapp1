"use client"

import type React from "react"

import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit"
import { WagmiProvider } from "wagmi"
import { QueryClientProvider, QueryClient } from "@tanstack/react-query"
import { defineChain } from "viem"
import "@rainbow-me/rainbowkit/styles.css"

// Define GOOD CARE Network chain
const goodCareNetwork = defineChain({
  id: 741741,
  name: "GOOD CARE Network",
  nativeCurrency: {
    decimals: 18,
    name: "CARE",
    symbol: "CARE",
  },
  rpcUrls: {
    default: {
      http: ["https://subnets.avax.network/goodcare/mainnet/rpc"],
    },
  },
  blockExplorers: {
    default: {
      name: "GOOD CARE Explorer",
      url: "https://subnets.avax.network/goodcare",
    },
  },
})

// Configure wagmi with your WalletConnect project ID
const config = getDefaultConfig({
  appName: "GOOD CARE Network",
  projectId: "96ac3be93570659af072073d3e77c2b6",
  chains: [goodCareNetwork],
  ssr: true,
})

// Create query client
const queryClient = new QueryClient()

interface WalletProviderProps {
  children: React.ReactNode
}

export function WalletProvider({ children }: WalletProviderProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

// Export for backward compatibility
export { WalletProvider as WalletProviderWrapper }

// Custom hook for backward compatibility
export function useWallet() {
  // This can be implemented using wagmi hooks if needed
  return {
    publicKey: null,
    connected: false,
    connect: async () => {},
    disconnect: () => {},
    wallet: null,
  }
}
