import { createClient } from "@supabase/supabase-js"

interface AvaCloudWallet {
  walletId: string
  address: string
  chainId: string
  balance: string
}

interface TwitterUser {
  id: string
  name: string
  screen_name: string
  profile_image_url: string
  email?: string
}

interface UserProfile {
  id: string
  twitter_id: string
  username: string
  display_name: string
  email?: string
  avatar_url: string
  wallet_address: string
  wallet_id: string
  created_at: string
  updated_at: string
}

export class AvaCloudTwitterIntegration {
  private supabase
  private avaCloudApiKey: string
  private avaCloudProjectId: string

  constructor() {
    this.supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    this.avaCloudApiKey =
      process.env.AVACLOUD_API_KEY ||
      "ac_IGPLXu_LC7RmwOlFRcSUfOYanSuTzMbjXFLJG97yz3MUgN0woln5uWB0yZrEDlwvpnKkz_2-P9igfE6KdipsEw"
    this.avaCloudProjectId = process.env.NEXT_PUBLIC_AVACLOUD_PROJECT_ID || "your_project_id_here"
  }

  async createEmbeddedWallet(twitterUser: TwitterUser): Promise<AvaCloudWallet> {
    try {
      // For now, we'll create a mock wallet since AvaCloud integration needs proper setup
      // In production, this would call the actual AvaCloud API
      const mockWallet: AvaCloudWallet = {
        walletId: `wallet_${twitterUser.id}_${Date.now()}`,
        address: `0x${crypto.randomUUID().replace(/-/g, "").substring(0, 40)}`,
        chainId: "43114", // Avalanche mainnet
        balance: "0",
      }

      console.log("Created embedded wallet for Twitter user:", {
        twitterId: twitterUser.id,
        walletId: mockWallet.walletId,
        address: mockWallet.address,
      })

      return mockWallet
    } catch (error) {
      console.error("Error creating embedded wallet:", error)
      throw error
    }
  }

  async createOrUpdateUserProfile(twitterUser: TwitterUser, wallet: AvaCloudWallet): Promise<UserProfile> {
    try {
      // Check if user already exists
      const { data: existingUser } = await this.supabase
        .from("user_profiles")
        .select("*")
        .eq("twitter_id", twitterUser.id)
        .single()

      const userProfile = {
        twitter_id: twitterUser.id,
        username: twitterUser.screen_name,
        display_name: twitterUser.name,
        email: twitterUser.email,
        avatar_url: twitterUser.profile_image_url,
        wallet_address: wallet.address,
        wallet_id: wallet.walletId,
        updated_at: new Date().toISOString(),
      }

      if (existingUser) {
        // Update existing user
        const { data, error } = await this.supabase
          .from("user_profiles")
          .update(userProfile)
          .eq("twitter_id", twitterUser.id)
          .select()
          .single()

        if (error) throw error
        return data
      } else {
        // Create new user
        const { data, error } = await this.supabase
          .from("user_profiles")
          .insert({
            ...userProfile,
            created_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (error) throw error
        return data
      }
    } catch (error) {
      console.error("Error creating/updating user profile:", error)
      throw error
    }
  }

  async processTwitterLogin(twitterUser: TwitterUser): Promise<UserProfile> {
    try {
      console.log("Processing Twitter login for user:", twitterUser.screen_name)

      // Create embedded wallet
      const wallet = await this.createEmbeddedWallet(twitterUser)

      // Create or update user profile
      const userProfile = await this.createOrUpdateUserProfile(twitterUser, wallet)

      console.log("Successfully processed Twitter login:", {
        userId: userProfile.id,
        username: userProfile.username,
        walletAddress: userProfile.wallet_address,
      })

      return userProfile
    } catch (error) {
      console.error("Error processing Twitter login:", error)
      throw error
    }
  }

  async getUserProfile(twitterId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await this.supabase.from("user_profiles").select("*").eq("twitter_id", twitterId).single()

      if (error && error.code !== "PGRST116") {
        throw error
      }

      return data
    } catch (error) {
      console.error("Error getting user profile:", error)
      return null
    }
  }
}

export const avaCloudTwitterIntegration = new AvaCloudTwitterIntegration()
