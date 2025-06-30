"use client"

import { createContext, useContext, type ReactNode } from "react"
import { createConfig, WagmiProvider, useAccount, useConnect, useDisconnect } from "wagmi"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { metaMask, coinbaseWallet } from "wagmi/connectors"
import { http } from "viem"
import { defineChain } from "viem"

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
const queryClient = new QueryClient()

interface WalletContextType {
  address: string | undefined
  isConnected: boolean
  isConnecting: boolean
  connect: (connectorId?: string) => Promise<void>
  disconnect: () => Promise<void>
  chainId: number | undefined
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

function WalletProviderInner({ children }: { children: ReactNode }) {
  const { address, isConnected, chainId } = useAccount()
  const { connect: wagmiConnect, connectors, isPending } = useConnect()
  const { disconnect: wagmiDisconnect } = useDisconnect()

  const connect = async (connectorId?: string) => {
    try {
      const connector = connectorId ? connectors.find((c) => c.id === connectorId) || connectors[0] : connectors[0]

      if (connector) {
        await wagmiConnect({ connector })
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error)
    }
  }

  const disconnect = async () => {
    try {
      await wagmiDisconnect()
    } catch (error) {
      console.error("Failed to disconnect wallet:", error)
    }
  }

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnected,
        isConnecting: isPending,
        connect,
        disconnect,
        chainId,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function WalletProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <WalletProviderInner>{children}</WalletProviderInner>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}
