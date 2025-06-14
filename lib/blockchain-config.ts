import { JsonRpcProvider, BrowserProvider, parseUnits, formatUnits } from "ethers"

// GOOD CARE Subnet Configuration
export const GOOD_CARE_NETWORK = {
  chainId: 741741,
  name: "GOOD CARE Network",
  rpcUrl: "https://subnets.avax.network/goodcare/mainnet/rpc",
  explorerUrl: "https://subnets.avax.network/goodcare",
  nativeCurrency: {
    name: "CARE",
    symbol: "CARE",
    decimals: 18,
  },
}

// Token addresses on GOOD CARE subnet
export const TOKEN_ADDRESSES = {
  GCT: "0x10acd62bdfa7028b0A96710a9f6406446D2b1164",
}

// AvaCloud Configuration
export const AVACLOUD_CONFIG = {
  apiKey:
    process.env.AVACLOUD_API_KEY ||
    "ac_IGPLXu_LC7RmwOlFRcSUfOYanSuTzMbjXFLJG97yz3MUgN0woln5uWB0yZrEDlwvpnKkz_2-P9igfE6KdipsEw",
  projectId: process.env.NEXT_PUBLIC_AVACLOUD_PROJECT_ID || "",
  baseUrl: "https://glacier-api.avax.network",
}

// Chain configuration for wallet switching
export const CHAIN_CONFIG = {
  chainId: `0x${GOOD_CARE_NETWORK.chainId.toString(16)}`, // 0xb5155
  chainName: GOOD_CARE_NETWORK.name,
  nativeCurrency: GOOD_CARE_NETWORK.nativeCurrency,
  rpcUrls: [GOOD_CARE_NETWORK.rpcUrl],
  blockExplorerUrls: [GOOD_CARE_NETWORK.explorerUrl],
}

// Function to switch to GOOD CARE network
export const switchToGoodCareNetwork = async () => {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("No wallet found")
  }

  try {
    // Try to switch to the network
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: CHAIN_CONFIG.chainId }],
    })
  } catch (switchError: any) {
    // If the chain hasn't been added to the user's wallet, add it
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [CHAIN_CONFIG],
        })
      } catch (addError) {
        throw new Error("Failed to add GOOD CARE network to wallet")
      }
    } else {
      throw new Error("Failed to switch to GOOD CARE network")
    }
  }
}

// Get provider instance
export const getProvider = () => {
  if (typeof window !== "undefined" && window.ethereum) {
    return new BrowserProvider(window.ethereum)
  }
  return new JsonRpcProvider(GOOD_CARE_NETWORK.rpcUrl)
}

// Helper function to check if we're on the correct network
export const isOnGoodCareNetwork = (chainId: number) => {
  return chainId === GOOD_CARE_NETWORK.chainId
}

// Helper function to format chain ID for display
export const formatChainId = (chainId: number) => {
  return `0x${chainId.toString(16)}`
}

// Utility functions for token amounts
export const parseTokenAmount = (amount: string, decimals = 18) => {
  return parseUnits(amount, decimals)
}

export const formatTokenAmount = (amount: bigint, decimals = 18) => {
  return formatUnits(amount, decimals)
}
