"use client"

import { WagmiProvider, createConfig, http } from "wagmi"
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
  },
  blockExplorers: {
    default: {
      name: "GOOD CARE Explorer",
      url: "https://subnets.avax.network/goodcare",
    },
  },
} as const

const config = createConfig(
  getDefaultConfig({
    chains: [goodCareSubnet, mainnet, sepolia],
    transports: {
      [goodCareSubnet.id]: http(process.env.NEXT_PUBLIC_GOODCARE_RPC),
      [mainnet.id]: http(),
      [sepolia.id]: http(),
    },
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",
    appName: "GOOD CARE DApp",
    appDescription: "Your GOOD Passport - A living reflection of care, contributions, and healing",
    appUrl: "https://goodcare.network",
    appIcon: "https://goodcare.network/icon.png",
  }),
)

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
          customTheme={{
            "--ck-accent-color": "#10b981",
            "--ck-accent-text-color": "#ffffff",
            "--ck-border-radius": "8px",
          }}
        >
          {children}
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
