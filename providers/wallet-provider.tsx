"use client"

import type React from "react"
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit"
import { WagmiProvider } from "wagmi"
import { QueryClientProvider, QueryClient } from "@tanstack/react-query"
import { defineChain } from "viem"
import { metaMask, coinbaseWallet } from "wagmi/connectors"

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

// Configure wagmi with specific connectors (removed WalletConnect to fix domain error)
const config = getDefaultConfig({
  appName: "GOOD CARE Network",
  projectId: "96ac3be93570659af072073d3e77c2b6",
  chains: [goodCareNetwork],
  connectors: [
    metaMask({
      dappMetadata: {
        name: "GOOD CARE Network",
        url: "https://goodonavax.vercel.app",
      },
    }),
    coinbaseWallet({
      appName: "GOOD CARE Network",
      appLogoUrl: "https://goodonavax.vercel.app/placeholder-logo.png",
    }),
  ],
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
        <RainbowKitProvider
          modalSize="compact"
          theme={{
            lightMode: {
              colors: {
                accentColor: "#10b981",
                accentColorForeground: "white",
                actionButtonBorder: "rgba(0, 0, 0, 0.04)",
                actionButtonBorderMobile: "rgba(0, 0, 0, 0.06)",
                actionButtonSecondaryBackground: "rgba(0, 0, 0, 0.06)",
                closeButton: "rgba(60, 66, 66, 0.8)",
                closeButtonBackground: "rgba(0, 0, 0, 0.06)",
                connectButtonBackground: "#10b981",
                connectButtonBackgroundError: "#FF494A",
                connectButtonInnerBackground: "linear-gradient(0deg, rgba(0, 0, 0, 0.03), rgba(0, 0, 0, 0.06))",
                connectButtonText: "white",
                connectButtonTextError: "white",
                connectionIndicator: "#30E000",
                downloadBottomCardBackground:
                  "linear-gradient(126deg, rgba(255, 255, 255, 0) 9.49%, rgba(171, 171, 171, 0.04) 71.04%), #FFFFFF",
                downloadTopCardBackground:
                  "linear-gradient(126deg, rgba(171, 171, 171, 0.2) 9.49%, rgba(255, 255, 255, 0) 71.04%), #FFFFFF",
                error: "#FF494A",
                generalBorder: "rgba(0, 0, 0, 0.06)",
                generalBorderDim: "rgba(0, 0, 0, 0.03)",
                menuItemBackground: "rgba(60, 66, 66, 0.1)",
                modalBackdrop: "rgba(0, 0, 0, 0.3)",
                modalBackground: "white",
                modalBorder: "rgba(0, 0, 0, 0.06)",
                modalText: "#25292E",
                modalTextDim: "rgba(60, 66, 66, 0.3)",
                modalTextSecondary: "rgba(60, 66, 66, 0.6)",
                profileAction: "white",
                profileActionHover: "rgba(255, 255, 255, 0.5)",
                profileForeground: "rgba(60, 66, 66, 0.06)",
                selectedOptionBorder: "rgba(60, 66, 66, 0.1)",
                standby: "#FFD641",
              },
            },
          }}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

// Export for backward compatibility
export { WalletProvider as WalletProviderWrapper }

// Custom hook for backward compatibility
export function useWallet() {
  return {
    publicKey: null,
    connected: false,
    connect: async () => {},
    disconnect: () => {},
    wallet: null,
  }
}
