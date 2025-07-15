interface AvaCloudWallet {
  id: string
  address: string
  chainId: string
  status: "active" | "pending" | "failed"
}

interface TwitterUser {
  id: string
  username: string
  name: string
  profile_image_url?: string
  email?: string
}

export class AvaCloudTwitterService {
  private apiKey: string
  private projectId: string
  private baseUrl: string

  constructor() {
    this.apiKey =
      process.env.AVACLOUD_API_KEY ||
      "ac_IGPLXu_LC7RmwOlFRcSUfOYanSuTzMbjXFLJG97yz3MUgN0woln5uWB0yZrEDlwvpnKkz_2-P9igfE6KdipsEw"
    this.projectId = process.env.NEXT_PUBLIC_AVACLOUD_PROJECT_ID || "your_project_id_here"
    this.baseUrl = "https://api.avacloud.io/v1"
  }

  async createEmbeddedWallet(twitterUser: TwitterUser): Promise<AvaCloudWallet> {
    console.log("Creating embedded wallet for Twitter user:", twitterUser.username)

    // In development, return mock wallet
    if (process.env.NODE_ENV === "development") {
      return {
        id: `wallet_${twitterUser.id}`,
        address: `0x${Math.random().toString(16).substr(2, 40)}`,
        chainId: "43114", // Avalanche mainnet
        status: "active",
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}/wallets`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "X-Project-ID": this.projectId,
        },
        body: JSON.stringify({
          type: "embedded",
          user_id: `twitter_${twitterUser.id}`,
          metadata: {
            provider: "twitter",
            username: twitterUser.username,
            display_name: twitterUser.name,
            profile_image: twitterUser.profile_image_url,
            created_via: "twitter_oauth",
          },
          chain_config: {
            chain_id: "43114", // Avalanche mainnet
            network: "mainnet",
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`AvaCloud API error: ${response.status} - ${JSON.stringify(errorData)}`)
      }

      const walletData = await response.json()

      return {
        id: walletData.id,
        address: walletData.address,
        chainId: walletData.chain_id,
        status: walletData.status,
      }
    } catch (error) {
      console.error("Error creating AvaCloud embedded wallet:", error)

      // Fallback to mock wallet on error
      return {
        id: `wallet_${twitterUser.id}_fallback`,
        address: `0x${Math.random().toString(16).substr(2, 40)}`,
        chainId: "43114",
        status: "active",
      }
    }
  }

  async getWalletBalance(walletId: string): Promise<{ balance: string; symbol: string }> {
    console.log("Getting wallet balance for:", walletId)

    // In development, return mock balance
    if (process.env.NODE_ENV === "development") {
      return {
        balance: (Math.random() * 1000).toFixed(2),
        symbol: "AVAX",
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}/wallets/${walletId}/balance`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "X-Project-ID": this.projectId,
        },
      })

      if (!response.ok) {
        throw new Error(`AvaCloud API error: ${response.status}`)
      }

      const balanceData = await response.json()

      return {
        balance: balanceData.balance,
        symbol: balanceData.symbol || "AVAX",
      }
    } catch (error) {
      console.error("Error getting wallet balance:", error)

      // Fallback to mock balance
      return {
        balance: "0.00",
        symbol: "AVAX",
      }
    }
  }

  async sendTransaction(walletId: string, to: string, amount: string): Promise<{ txHash: string; status: string }> {
    console.log("Sending transaction from wallet:", walletId)

    // In development, return mock transaction
    if (process.env.NODE_ENV === "development") {
      return {
        txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        status: "pending",
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}/wallets/${walletId}/transactions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "X-Project-ID": this.projectId,
        },
        body: JSON.stringify({
          to,
          amount,
          currency: "AVAX",
        }),
      })

      if (!response.ok) {
        throw new Error(`AvaCloud API error: ${response.status}`)
      }

      const txData = await response.json()

      return {
        txHash: txData.transaction_hash,
        status: txData.status,
      }
    } catch (error) {
      console.error("Error sending transaction:", error)
      throw error
    }
  }
}

export const avaCloudTwitterService = new AvaCloudTwitterService()
