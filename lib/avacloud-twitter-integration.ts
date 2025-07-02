import { AvaCloudWaaS } from "./avacloud-waas"
import { twitterAuth, type TwitterUser } from "./twitter-auth"

interface TwitterWalletResult {
  success: boolean
  user?: TwitterUser
  wallet?: {
    address: string
    privateKey: string
    provider: string
  }
  error?: string
}

export class AvaCloudTwitterIntegration {
  private avaCloud: AvaCloudWaaS

  constructor() {
    this.avaCloud = new AvaCloudWaaS(
      process.env.AVACLOUD_API_KEY ||
        "ac_IGPLXu_LC7RmwOlFRcSUfOYanSuTzMbjXFLJG97yz3MUgN0woln5uWB0yZrEDlwvpnKkz_2-P9igfE6KdipsEw",
    )
  }

  // Create embedded wallet with Twitter login
  async createWalletWithTwitter(twitterUser: TwitterUser): Promise<TwitterWalletResult> {
    try {
      console.log("Creating AvaCloud embedded wallet for Twitter user:", twitterUser.username)

      // Create embedded wallet using AvaCloud WaaS
      const walletResult = await this.avaCloud.createWalletWithSocial("twitter", twitterUser.id)

      if (!walletResult.address) {
        throw new Error("Failed to create embedded wallet")
      }

      console.log("Successfully created embedded wallet:", walletResult.address)

      return {
        success: true,
        user: twitterUser,
        wallet: {
          address: walletResult.address,
          privateKey: walletResult.privateKey,
          provider: "twitter",
        },
      }
    } catch (error) {
      console.error("Error creating Twitter wallet:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create wallet",
      }
    }
  }

  // Get Twitter auth URL
  async getTwitterAuthUrl(): Promise<{ url: string; state: string }> {
    try {
      const authData = await twitterAuth.getAuthUrl()

      // Store OAuth tokens in session/localStorage for callback
      const state = JSON.stringify({
        oauthToken: authData.oauthToken,
        oauthTokenSecret: authData.oauthTokenSecret,
        timestamp: Date.now(),
      })

      return {
        url: authData.url,
        state: Buffer.from(state).toString("base64"),
      }
    } catch (error) {
      console.error("Error getting Twitter auth URL:", error)
      throw error
    }
  }

  // Handle Twitter callback and create wallet
  async handleTwitterCallback(oauthToken: string, oauthVerifier: string, state: string): Promise<TwitterWalletResult> {
    try {
      // Decode state to get OAuth token secret
      const stateData = JSON.parse(Buffer.from(state, "base64").toString())

      if (!stateData.oauthTokenSecret) {
        throw new Error("Invalid OAuth state")
      }

      // Get Twitter user info
      const twitterUser = await twitterAuth.handleCallback(oauthToken, oauthVerifier, stateData.oauthTokenSecret)

      // Create embedded wallet
      return await this.createWalletWithTwitter(twitterUser)
    } catch (error) {
      console.error("Error handling Twitter callback:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Authentication failed",
      }
    }
  }

  // Get wallet balance
  async getWalletBalance(address: string): Promise<string> {
    return await this.avaCloud.getBalance(address)
  }

  // Send transaction
  async sendTransaction(from: string, to: string, amount: string, privateKey: string) {
    return await this.avaCloud.sendTransaction(from, to, amount, privateKey)
  }
}

export const avaCloudTwitter = new AvaCloudTwitterIntegration()
