// GOOD CARE Network Configuration
export const CHAIN_CONFIG = {
  chainId: 43114, // Avalanche Mainnet
  chainIdHex: "0xa86a",
  chainName: "GOOD CARE Network",
  nativeCurrency: {
    name: "CARE",
    symbol: "CARE",
    decimals: 18,
  },
  rpcUrls: [process.env.NEXT_PUBLIC_GOODCARE_RPC || "https://subnets.avax.network/goodcare/mainnet/rpc"],
  blockExplorerUrls: ["https://subnets.avax.network/goodcare"],
}

export const AVACLOUD_CONFIG = {
  projectId: process.env.NEXT_PUBLIC_AVACLOUD_PROJECT_ID || "",
  apiKey: process.env.AVACLOUD_API_KEY || "",
}

export const TOKEN_ADDRESSES = {
  GCT: "0x742d35Cc6634C0532925a3b8D4C2C4e0C8b8E8E8", // Mock GCT token address
  CARE: "0x0000000000000000000000000000000000000000", // Native CARE token
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
