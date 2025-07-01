"use client"

import { createConfig, WagmiProvider } from "wagmi"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { metaMask, coinbaseWallet } from "wagmi/connectors"
import { http } from "viem"
import { defineChain } from "viem"
import type { ReactNode } from "react"

// Define GOOD CARE Subnet
const goodCareSubnet = defineChain({
  id: 432201,
  name: "GOOD CARE Subnet",
  nativeCurrency: {
    decimals: 18,
    name: "GOOD",
    symbol: "GOOD",
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_GOODCARE_RPC || "https://subnets.avax.network/goodcare/mainnet/rpc"],
    },
  },
  blockExplorers: {
    default: {
      name: "GOOD CARE Explorer",
      url: "https://subnets.avax.network/goodcare",
    },
  },
})

// Create wagmi config
const config = createConfig({
  chains: [goodCareSubnet],
  connectors: [
    metaMask({
      dappMetadata: {
        name: "GOOD CARE DApp",
        url: "https://goodcare.network",
      },
    }),
    coinbaseWallet({
      appName: "GOOD CARE DApp",
      appLogoUrl: "/placeholder-logo.png",
    }),
  ],
  transports: {
    [goodCareSubnet.id]: http(),
  },
})

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
})

interface ClientWalletProviderProps {
  children: ReactNode
}

export function ClientWalletProvider({ children }: ClientWalletProviderProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}
