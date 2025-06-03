// GOOD CARE Network configuration
export const CHAIN_CONFIG = {
  chainId: 43114, // Avalanche Mainnet (GOOD CARE Subnet)
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

// Token contract addresses
export const TOKEN_ADDRESSES = {
  GCT: "0x1234567890abcdef1234567890abcdef12345678", // GOOD CARE Token
  CARE: "0x0000000000000000000000000000000000000000", // Native CARE token
}

// CARE Daily Reflections NFT contract address - UPDATED
export const REFLECTIONS_CONTRACT_ADDRESS = "0x141b77a109011475A4c347fD19Dd4ead79AE912F"

// Helper function to add the GOOD CARE Network to MetaMask or other wallets
export async function addGoodCareNetworkToWallet() {
  if (typeof window !== "undefined" && window.ethereum) {
    try {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: `0x${CHAIN_CONFIG.chainId.toString(16)}`, // Convert to hex
            chainName: CHAIN_CONFIG.chainName,
            nativeCurrency: CHAIN_CONFIG.nativeCurrency,
            rpcUrls: CHAIN_CONFIG.rpcUrls,
            blockExplorerUrls: CHAIN_CONFIG.blockExplorerUrls,
          },
        ],
      })
      return true
    } catch (error) {
      console.error("Error adding GOOD CARE Network to wallet:", error)
      return false
    }
  }
  return false
}

// Helper function to switch to the GOOD CARE Network
export async function switchToGoodCareNetwork() {
  if (typeof window !== "undefined" && window.ethereum) {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${CHAIN_CONFIG.chainId.toString(16)}` }], // Convert to hex
      })
      return true
    } catch (error: any) {
      // If the chain hasn't been added to MetaMask
      if (error.code === 4902) {
        return addGoodCareNetworkToWallet()
      }
      console.error("Error switching to GOOD CARE Network:", error)
      return false
    }
  }
  return false
}
