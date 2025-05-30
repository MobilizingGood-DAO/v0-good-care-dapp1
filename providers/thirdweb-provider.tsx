"use client"

import type React from "react"
import { ThirdwebProvider, type Chain } from "@thirdweb-dev/react"

// Define the GOOD CARE Subnet as a custom chain
const goodCareChain: Chain = {
  chainId: 741741,
  name: "GOOD CARE Network",
  nativeCurrency: {
    name: "CARE",
    symbol: "CARE",
    decimals: 18,
  },
  rpc: ["https://subnets.avax.network/goodcare/mainnet/rpc"],
  blockExplorers: [
    {
      name: "GOOD CARE Explorer",
      url: "https://subnets.avax.network/goodcare",
    },
  ],
  testnet: false,
}

interface ThirdwebWrapperProps {
  children: React.ReactNode
}

export function ThirdwebWrapper({ children }: ThirdwebWrapperProps) {
  return (
    <ThirdwebProvider activeChain={goodCareChain} clientId="16ca8dd20b03f76e6b39dc009db8970a">
      {children}
    </ThirdwebProvider>
  )
}
