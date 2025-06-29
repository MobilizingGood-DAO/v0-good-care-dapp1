"use client"

import { WagmiProvider } from "wagmi"
import { mainnet, sepolia } from "wagmi/chains"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ConnectKitProvider, getDefaultConfig } from "connectkit"
import type { ReactNode } from "react"

// Define GOOD CARE Subnet
const goodCareSubnet = {
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
    public: {
      http: [process.env.NEXT_PUBLIC_GOODCARE_RPC || "https://subnets.avax.network/goodcare/mainnet/rpc"],
    },
  },
  blockExplorers: {
    default: { name: "GOOD Explorer", url: "https://subnets.avax.network/goodcare" },
  },
  testnet: false,
} as const

const config = getDefaultConfig({
  // Your dApps chains
  chains: [goodCareSubnet, mainnet, sepolia],

  // Required API Keys
  walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",

  // Required App Info
  appName: "GOOD CARE DApp",
  appDescription: "Your GOOD Passport to a kinder, regenerative crypto experience",
  appUrl: "https://goodcare.network",
  appIcon: "https://goodcare.network/logo.png",
})

const queryClient = new QueryClient()

interface WalletProviderProps {
  children: ReactNode
}

export default function WalletProvider({ children }: WalletProviderProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider
          theme="auto"
          mode="light"
          options={{
            initialChainId: goodCareSubnet.id,
            enforceSupportedChains: false,
            disclaimer: (
              <div style={{ padding: "16px", textAlign: "center" }}>
                <p style={{ fontSize: "14px", color: "#666", marginBottom: "8px" }}>Welcome to GOOD CARE Network</p>
                <p style={{ fontSize: "12px", color: "#888" }}>Your embedded wallet for a kinder crypto experience</p>
              </div>
            ),
          }}
        >
          {children}
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
