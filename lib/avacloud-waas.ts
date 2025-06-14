import { getProvider } from "./blockchain-config"

// AvaCloud WaaS Service
export class AvaCloudWaaS {
  private apiKey: string
  private baseUrl: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
    this.baseUrl = "https://glacier-api.avax.network"
  }

  // Create embedded wallet via email
  async createWalletWithEmail(email: string) {
    try {
      // Mock implementation - replace with actual AvaCloud API calls
      const response = await fetch(`${this.baseUrl}/v1/wallets`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          type: "embedded",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create wallet")
      }

      const data = await response.json()
      return {
        address: data.address || `0x${Math.random().toString(16).substr(2, 40)}`,
        privateKey: data.privateKey || `0x${Math.random().toString(16).substr(2, 64)}`,
        email,
      }
    } catch (error) {
      console.error("Error creating wallet:", error)
      // Return mock data for development
      return {
        address: `0x${Math.random().toString(16).substr(2, 40)}`,
        privateKey: `0x${Math.random().toString(16).substr(2, 64)}`,
        email,
      }
    }
  }

  // Create embedded wallet via social login
  async createWalletWithSocial(provider: string, token: string) {
    try {
      // Mock implementation - replace with actual AvaCloud API calls
      const response = await fetch(`${this.baseUrl}/v1/wallets/social`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider,
          token,
          type: "embedded",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create social wallet")
      }

      const data = await response.json()
      return {
        address: data.address || `0x${Math.random().toString(16).substr(2, 40)}`,
        privateKey: data.privateKey || `0x${Math.random().toString(16).substr(2, 64)}`,
        provider,
        socialId: data.socialId || Math.random().toString(),
      }
    } catch (error) {
      console.error("Error creating social wallet:", error)
      // Return mock data for development
      return {
        address: `0x${Math.random().toString(16).substr(2, 40)}`,
        privateKey: `0x${Math.random().toString(16).substr(2, 64)}`,
        provider,
        socialId: Math.random().toString(),
      }
    }
  }

  // Get wallet balance
  async getBalance(address: string) {
    try {
      const provider = getProvider()
      const balance = await provider.getBalance(address)
      return balance.toString()
    } catch (error) {
      console.error("Error getting balance:", error)
      return "0"
    }
  }

  // Send transaction
  async sendTransaction(from: string, to: string, amount: string, privateKey: string) {
    try {
      const provider = getProvider()
      // This would need proper implementation with wallet signing
      // For now, return mock transaction hash
      return {
        hash: `0x${Math.random().toString(16).substr(2, 64)}`,
        success: true,
      }
    } catch (error) {
      console.error("Error sending transaction:", error)
      throw error
    }
  }
}

// Create singleton instance
const avaCloudWaaS = new AvaCloudWaaS(
  process.env.AVACLOUD_API_KEY ||
    "ac_IGPLXu_LC7RmwOlFRcSUfOYanSuTzMbjXFLJG97yz3MUgN0woln5uWB0yZrEDlwvpnKkz_2-P9igfE6KdipsEw",
)

// Export functions for backward compatibility
export const loginWithEmail = async (email: string) => {
  return avaCloudWaaS.createWalletWithEmail(email)
}

export const loginWithSocial = async (provider: string, token: string) => {
  return avaCloudWaaS.createWalletWithSocial(provider, token)
}

export const getWalletBalance = async (address: string) => {
  return avaCloudWaaS.getBalance(address)
}

export const sendTokens = async (from: string, to: string, amount: string, privateKey: string) => {
  return avaCloudWaaS.sendTransaction(from, to, amount, privateKey)
}

export default avaCloudWaaS
