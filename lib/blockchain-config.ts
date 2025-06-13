// GOOD CARE Network Configuration
export const CHAIN_CONFIG = {
  chainId: 741741,
  chainIdHex: "0xB5155", // 741741 in hex
  chainName: "GOOD CARE Network",
  nativeCurrency: {
    name: "CARE",
    symbol: "CARE",
    decimals: 18,
  },
  rpcUrls: ["https://subnets.avax.network/goodcare/mainnet/rpc"],
  blockExplorerUrls: ["https://subnets.avax.network/goodcare"],
}

export const AVACLOUD_CONFIG = {
  projectId: process.env.NEXT_PUBLIC_AVACLOUD_PROJECT_ID || "",
  apiKey:
    process.env.AVACLOUD_API_KEY ||
    "ac_IGPLXu_LC7RmwOlFRcSUfOYanSuTzMbjXFLJG97yz3MUgN0woln5uWB0yZrEDlwvpnKkz_2-P9igfE6KdipsEw",
}

export const TOKEN_ADDRESSES = {
  GCT: "0x10acd62bdfa7028b0A96710a9f6406446D2b1164",
  CARE: "0x0000000000000000000000000000000000000000", // Native token
}

export const GOOD_CARE_NETWORK = {
  chainId: 741741,
  name: "GOOD CARE Subnet",
  rpcUrl: "https://subnets.avax.network/goodcare/mainnet/rpc",
  explorerUrl: "https://subnets.avax.network/goodcare",
  nativeCurrency: {
    name: "CARE",
    symbol: "CARE",
    decimals: 18,
  },
  tokens: {
    GCT: {
      address: "0x10acd62bdfa7028b0A96710a9f6406446D2b1164",
      name: "GOOD CARE Token",
      symbol: "GCT",
      decimals: 18,
    },
  },
}

export async function switchToGoodCareNetwork(): Promise<boolean> {
  try {
    if (typeof window === "undefined" || !window.ethereum) {
      return false
    }

    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: CHAIN_CONFIG.chainIdHex }],
    })

    return true
  } catch (error: any) {
    if (error.code === 4902) {
      // Chain not added to wallet, try to add it
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [CHAIN_CONFIG],
        })
        return true
      } catch (addError) {
        console.error("Error adding chain:", addError)
        return false
      }
    }
    console.error("Error switching network:", error)
    return false
  }
}

// Helper function to get network info
export function getNetworkInfo() {
  return {
    chainId: CHAIN_CONFIG.chainId,
    chainName: CHAIN_CONFIG.chainName,
    rpcUrl: CHAIN_CONFIG.rpcUrls[0],
    explorerUrl: CHAIN_CONFIG.blockExplorerUrls[0],
    nativeCurrency: CHAIN_CONFIG.nativeCurrency,
  }
}

// Helper function to check if we're on the correct network
export function isGoodCareNetwork(chainId: number): boolean {
  return chainId === CHAIN_CONFIG.chainId
}
