import crypto from "crypto"

interface TwitterOAuthConfig {
  apiKey: string
  apiSecret: string
  accessToken: string
  accessTokenSecret: string
  callbackUrl: string
}

interface TwitterUser {
  id: string
  username: string
  name: string
  profile_image_url?: string
  email?: string
}

export class TwitterAuthService {
  private config: TwitterOAuthConfig

  constructor() {
    this.config = {
      apiKey: process.env.TWITTER_API_KEY || "870vfO8m4SvC2eZjl4cBxvVBo",
      apiSecret: process.env.TWITTER_API_KEY_SECRET || "exuCGhtUhVe9tYE1psdwozjIZWLmmpFFh7inVmmqP7Ia0YVbRW",
      accessToken: process.env.TWITTER_ACCESS_TOKEN || "1734256336139882496-USaYTf5dNTa3nMlxPgDi3uiUSBBuzc",
      accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET || "JWa8Eq28j9EzhigzJbLT6zKdoIqI1VOoloahSNbPb4gM3",
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/twitter/callback`,
    }
  }

  private generateNonce(): string {
    return crypto.randomBytes(16).toString("hex")
  }

  private generateTimestamp(): string {
    return Math.floor(Date.now() / 1000).toString()
  }

  private percentEncode(str: string): string {
    return encodeURIComponent(str)
      .replace(/!/g, "%21")
      .replace(/'/g, "%27")
      .replace(/\(/g, "%28")
      .replace(/\)/g, "%29")
      .replace(/\*/g, "%2A")
  }

  private generateSignature(method: string, url: string, params: Record<string, string>, tokenSecret = ""): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => `${this.percentEncode(key)}=${this.percentEncode(params[key])}`)
      .join("&")

    const baseString = `${method}&${this.percentEncode(url)}&${this.percentEncode(sortedParams)}`
    const signingKey = `${this.percentEncode(this.config.apiSecret)}&${this.percentEncode(tokenSecret)}`

    return crypto.createHmac("sha1", signingKey).update(baseString).digest("base64")
  }

  async getRequestToken(): Promise<{ token: string; tokenSecret: string; authUrl: string }> {
    const url = "https://api.twitter.com/oauth/request_token"
    const nonce = this.generateNonce()
    const timestamp = this.generateTimestamp()

    const params = {
      oauth_callback: this.config.callbackUrl,
      oauth_consumer_key: this.config.apiKey,
      oauth_nonce: nonce,
      oauth_signature_method: "HMAC-SHA1",
      oauth_timestamp: timestamp,
      oauth_version: "1.0",
    }

    const signature = this.generateSignature("POST", url, params)
    params["oauth_signature"] = signature

    const authHeader =
      "OAuth " +
      Object.keys(params)
        .map((key) => `${this.percentEncode(key)}="${this.percentEncode(params[key])}"`)
        .join(", ")

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })

      if (!response.ok) {
        throw new Error(`Twitter API error: ${response.status}`)
      }

      const data = await response.text()
      const parsed = new URLSearchParams(data)

      const token = parsed.get("oauth_token")
      const tokenSecret = parsed.get("oauth_token_secret")

      if (!token || !tokenSecret) {
        throw new Error("Failed to get request token from Twitter")
      }

      return {
        token,
        tokenSecret,
        authUrl: `https://api.twitter.com/oauth/authenticate?oauth_token=${token}`,
      }
    } catch (error) {
      console.error("Error getting request token:", error)
      throw error
    }
  }

  async getAccessToken(
    requestToken: string,
    requestTokenSecret: string,
    verifier: string,
  ): Promise<{ token: string; tokenSecret: string; userId: string; screenName: string }> {
    const url = "https://api.twitter.com/oauth/access_token"
    const nonce = this.generateNonce()
    const timestamp = this.generateTimestamp()

    const params = {
      oauth_consumer_key: this.config.apiKey,
      oauth_nonce: nonce,
      oauth_signature_method: "HMAC-SHA1",
      oauth_timestamp: timestamp,
      oauth_token: requestToken,
      oauth_verifier: verifier,
      oauth_version: "1.0",
    }

    const signature = this.generateSignature("POST", url, params, requestTokenSecret)
    params["oauth_signature"] = signature

    const authHeader =
      "OAuth " +
      Object.keys(params)
        .map((key) => `${this.percentEncode(key)}="${this.percentEncode(params[key])}"`)
        .join(", ")

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })

      if (!response.ok) {
        throw new Error(`Twitter API error: ${response.status}`)
      }

      const data = await response.text()
      const parsed = new URLSearchParams(data)

      return {
        token: parsed.get("oauth_token") || "",
        tokenSecret: parsed.get("oauth_token_secret") || "",
        userId: parsed.get("user_id") || "",
        screenName: parsed.get("screen_name") || "",
      }
    } catch (error) {
      console.error("Error getting access token:", error)
      throw error
    }
  }

  async getUserInfo(accessToken: string, accessTokenSecret: string): Promise<TwitterUser> {
    const url = "https://api.twitter.com/1.1/account/verify_credentials.json"
    const nonce = this.generateNonce()
    const timestamp = this.generateTimestamp()

    const params = {
      oauth_consumer_key: this.config.apiKey,
      oauth_nonce: nonce,
      oauth_signature_method: "HMAC-SHA1",
      oauth_timestamp: timestamp,
      oauth_token: accessToken,
      oauth_version: "1.0",
      include_email: "true",
    }

    const signature = this.generateSignature("GET", url, params, accessTokenSecret)
    params["oauth_signature"] = signature

    const authHeader =
      "OAuth " +
      Object.keys(params)
        .filter((key) => key !== "include_email")
        .map((key) => `${this.percentEncode(key)}="${this.percentEncode(params[key])}"`)
        .join(", ")

    try {
      const response = await fetch(`${url}?include_email=true`, {
        method: "GET",
        headers: {
          Authorization: authHeader,
        },
      })

      if (!response.ok) {
        throw new Error(`Twitter API error: ${response.status}`)
      }

      const userData = await response.json()

      return {
        id: userData.id_str,
        username: userData.screen_name,
        name: userData.name,
        profile_image_url: userData.profile_image_url_https,
        email: userData.email,
      }
    } catch (error) {
      console.error("Error getting user info:", error)
      throw error
    }
  }
}

export const twitterAuth = new TwitterAuthService()
