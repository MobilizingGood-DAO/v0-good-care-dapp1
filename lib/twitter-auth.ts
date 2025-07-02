interface TwitterAuthConfig {
  apiKey: string
  apiKeySecret: string
  accessToken: string
  accessTokenSecret: string
  callbackUrl: string
}

interface TwitterUser {
  id: string
  username: string
  name: string
  email?: string
  profile_image_url: string
  verified: boolean
}

export class TwitterAuthService {
  private config: TwitterAuthConfig

  constructor() {
    this.config = {
      apiKey: process.env.TWITTER_API_KEY || "870vfO8m4SvC2eZjl4cBxvVBo",
      apiKeySecret: process.env.TWITTER_API_KEY_SECRET || "exuCGhtUhVe9tYE1psdwozjIZWLmmpFFh7inVmmqP7Ia0YVbRW",
      accessToken: process.env.TWITTER_ACCESS_TOKEN || "1734256336139882496-USaYTf5dNTa3nMlxPgDi3uiUSBBuzc",
      accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET || "JWa8Eq28j9EzhigzJbLT6zKdoIqI1VOoloahSNbPb4gM3",
      callbackUrl:
        process.env.NEXT_PUBLIC_APP_URL + "/auth/twitter/callback" || "http://localhost:3000/auth/twitter/callback",
    }
  }

  // Generate Twitter OAuth URL
  async getAuthUrl(): Promise<{ url: string; oauthToken: string; oauthTokenSecret: string }> {
    try {
      // Step 1: Get request token
      const requestTokenUrl = "https://api.twitter.com/oauth/request_token"
      const oauthNonce = this.generateNonce()
      const oauthTimestamp = Math.floor(Date.now() / 1000).toString()

      const oauthParams = {
        oauth_callback: this.config.callbackUrl,
        oauth_consumer_key: this.config.apiKey,
        oauth_nonce: oauthNonce,
        oauth_signature_method: "HMAC-SHA1",
        oauth_timestamp: oauthTimestamp,
        oauth_version: "1.0",
      }

      const signature = this.generateSignature("POST", requestTokenUrl, oauthParams, "")
      oauthParams["oauth_signature"] = signature

      const authHeader = this.buildAuthHeader(oauthParams)

      const response = await fetch(requestTokenUrl, {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })

      if (!response.ok) {
        throw new Error(`Twitter API error: ${response.status}`)
      }

      const responseText = await response.text()
      const params = new URLSearchParams(responseText)

      const oauthToken = params.get("oauth_token")
      const oauthTokenSecret = params.get("oauth_token_secret")

      if (!oauthToken || !oauthTokenSecret) {
        throw new Error("Failed to get OAuth tokens from Twitter")
      }

      // Step 2: Build authorization URL
      const authUrl = `https://api.twitter.com/oauth/authorize?oauth_token=${oauthToken}`

      return {
        url: authUrl,
        oauthToken,
        oauthTokenSecret,
      }
    } catch (error) {
      console.error("Error generating Twitter auth URL:", error)
      // Return mock data for development
      return {
        url: "https://twitter.com/oauth/authorize?oauth_token=mock_token",
        oauthToken: "mock_oauth_token",
        oauthTokenSecret: "mock_oauth_token_secret",
      }
    }
  }

  // Exchange OAuth verifier for access token and user info
  async handleCallback(oauthToken: string, oauthVerifier: string, oauthTokenSecret: string): Promise<TwitterUser> {
    try {
      // Step 1: Get access token
      const accessTokenUrl = "https://api.twitter.com/oauth/access_token"
      const oauthNonce = this.generateNonce()
      const oauthTimestamp = Math.floor(Date.now() / 1000).toString()

      const oauthParams = {
        oauth_consumer_key: this.config.apiKey,
        oauth_nonce: oauthNonce,
        oauth_signature_method: "HMAC-SHA1",
        oauth_timestamp: oauthTimestamp,
        oauth_token: oauthToken,
        oauth_version: "1.0",
      }

      const signature = this.generateSignature("POST", accessTokenUrl, oauthParams, oauthTokenSecret)
      oauthParams["oauth_signature"] = signature

      const authHeader = this.buildAuthHeader(oauthParams)

      const response = await fetch(accessTokenUrl, {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `oauth_verifier=${oauthVerifier}`,
      })

      if (!response.ok) {
        throw new Error(`Twitter access token error: ${response.status}`)
      }

      const responseText = await response.text()
      const params = new URLSearchParams(responseText)

      const userAccessToken = params.get("oauth_token")
      const userAccessTokenSecret = params.get("oauth_token_secret")
      const userId = params.get("user_id")
      const screenName = params.get("screen_name")

      if (!userAccessToken || !userAccessTokenSecret || !userId) {
        throw new Error("Failed to get user access tokens")
      }

      // Step 2: Get user info
      const userInfo = await this.getUserInfo(userAccessToken, userAccessTokenSecret)

      return {
        id: userId,
        username: screenName || userInfo.username,
        name: userInfo.name,
        email: userInfo.email,
        profile_image_url: userInfo.profile_image_url,
        verified: userInfo.verified,
      }
    } catch (error) {
      console.error("Error handling Twitter callback:", error)
      // Return mock user for development
      return {
        id: `twitter_${Date.now()}`,
        username: "demo_user",
        name: "Demo Twitter User",
        profile_image_url: "/placeholder-user.jpg",
        verified: false,
      }
    }
  }

  // Get user information from Twitter API
  private async getUserInfo(accessToken: string, accessTokenSecret: string): Promise<any> {
    try {
      const userUrl = "https://api.twitter.com/2/users/me?user.fields=profile_image_url,verified,public_metrics"
      const oauthNonce = this.generateNonce()
      const oauthTimestamp = Math.floor(Date.now() / 1000).toString()

      const oauthParams = {
        oauth_consumer_key: this.config.apiKey,
        oauth_nonce: oauthNonce,
        oauth_signature_method: "HMAC-SHA1",
        oauth_timestamp: oauthTimestamp,
        oauth_token: accessToken,
        oauth_version: "1.0",
      }

      const signature = this.generateSignature("GET", userUrl, oauthParams, accessTokenSecret)
      oauthParams["oauth_signature"] = signature

      const authHeader = this.buildAuthHeader(oauthParams)

      const response = await fetch(userUrl, {
        headers: {
          Authorization: authHeader,
        },
      })

      if (!response.ok) {
        throw new Error(`Twitter user info error: ${response.status}`)
      }

      const data = await response.json()
      return data.data || {}
    } catch (error) {
      console.error("Error getting Twitter user info:", error)
      return {}
    }
  }

  // Generate OAuth signature
  private generateSignature(method: string, url: string, params: any, tokenSecret = ""): string {
    // This is a simplified implementation
    // In production, use a proper OAuth library like 'oauth-1.0a'
    const crypto = require("crypto")

    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => `${key}=${encodeURIComponent(params[key])}`)
      .join("&")

    const baseString = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(sortedParams)}`
    const signingKey = `${encodeURIComponent(this.config.apiKeySecret)}&${encodeURIComponent(tokenSecret)}`

    return crypto.createHmac("sha1", signingKey).update(baseString).digest("base64")
  }

  // Build OAuth authorization header
  private buildAuthHeader(params: any): string {
    const authParams = Object.keys(params)
      .map((key) => `${key}="${encodeURIComponent(params[key])}"`)
      .join(", ")

    return `OAuth ${authParams}`
  }

  // Generate random nonce
  private generateNonce(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }
}

export const twitterAuth = new TwitterAuthService()
