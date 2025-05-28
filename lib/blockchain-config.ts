export const CHAIN_CONFIG = {
  chainId: 741741,
  chainName: "GOOD CARE Network",
  nativeCurrency: {
    name: "CARE",
    symbol: "CARE",
    decimals: 18,
  },
  rpcUrls: [process.env.NEXT_PUBLIC_GOODCARE_RPC || "https://subnets.avax.network/goodcare/mainnet/rpc"],
  blockExplorerUrls: ["https://explorer.goodcare.network"],
}

export const AVACLOUD_CONFIG = {
  projectId: process.env.NEXT_PUBLIC_AVACLOUD_PROJECT_ID || "",
}

// GCT Token contract address
export const GCT_TOKEN_ADDRESS = "0x10acd62bdfa7028b0A96710a9f6406446D2b1164"

// Reflections NFT contract address
export const REFLECTIONS_CONTRACT_ADDRESS = "0x5fb4048031364A47c320236312fF66CB42ae822F"

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
