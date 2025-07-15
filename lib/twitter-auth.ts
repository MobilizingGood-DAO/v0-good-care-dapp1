import crypto from "crypto"

interface TwitterOAuthConfig {
  apiKey: string
  apiSecret: string
  accessToken: string
  accessTokenSecret: string
  callbackUrl: string
}

interface TwitterRequestToken {
  oauth_token: string
  oauth_token_secret: string
  oauth_callback_confirmed: string
}

interface TwitterAccessToken {
  oauth_token: string
  oauth_token_secret: string
  user_id: string
  screen_name: string
}

interface TwitterUser {
  id: string
  name: string
  screen_name: string
  profile_image_url: string
  email?: string
}

export class TwitterAuth {
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

    const baseString = [method.toUpperCase(), this.percentEncode(url), this.percentEncode(sortedParams)].join("&")

    const signingKey = `${this.percentEncode(this.config.apiSecret)}&${this.percentEncode(tokenSecret)}`

    return crypto.createHmac("sha1", signingKey).update(baseString).digest("base64")
  }

  private generateAuthHeader(
    method: string,
    url: string,
    params: Record<string, string>,
    tokenSecret = "",
    token = "",
  ): string {
    const oauthParams: Record<string, string> = {
      oauth_consumer_key: this.config.apiKey,
      oauth_nonce: this.generateNonce(),
      oauth_signature_method: "HMAC-SHA1",
      oauth_timestamp: this.generateTimestamp(),
      oauth_version: "1.0",
      ...params,
    }

    if (token) {
      oauthParams.oauth_token = token
    }

    const signature = this.generateSignature(method, url, oauthParams, tokenSecret)
    oauthParams.oauth_signature = signature

    const authParams = Object.keys(oauthParams)
      .filter((key) => key.startsWith("oauth_"))
      .sort()
      .map((key) => `${this.percentEncode(key)}="${this.percentEncode(oauthParams[key])}"`)
      .join(", ")

    return `OAuth ${authParams}`
  }

  async getRequestToken(): Promise<TwitterRequestToken> {
    const url = "https://api.twitter.com/oauth/request_token"
    const params = {
      oauth_callback: this.config.callbackUrl,
    }

    const authHeader = this.generateAuthHeader("POST", url, params)

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })

      if (!response.ok) {
        throw new Error(`Twitter API error: ${response.status} ${response.statusText}`)
      }

      const responseText = await response.text()
      const params_parsed = new URLSearchParams(responseText)

      return {
        oauth_token: params_parsed.get("oauth_token") || "",
        oauth_token_secret: params_parsed.get("oauth_token_secret") || "",
        oauth_callback_confirmed: params_parsed.get("oauth_callback_confirmed") || "",
      }
    } catch (error) {
      console.error("Error getting request token:", error)
      throw error
    }
  }

  getAuthorizationUrl(requestToken: string): string {
    return `https://api.twitter.com/oauth/authorize?oauth_token=${requestToken}`
  }

  async getAccessToken(
    requestToken: string,
    requestTokenSecret: string,
    verifier: string,
  ): Promise<TwitterAccessToken> {
    const url = "https://api.twitter.com/oauth/access_token"
    const params = {
      oauth_verifier: verifier,
    }

    const authHeader = this.generateAuthHeader("POST", url, params, requestTokenSecret, requestToken)

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })

      if (!response.ok) {
        throw new Error(`Twitter API error: ${response.status} ${response.statusText}`)
      }

      const responseText = await response.text()
      const params_parsed = new URLSearchParams(responseText)

      return {
        oauth_token: params_parsed.get("oauth_token") || "",
        oauth_token_secret: params_parsed.get("oauth_token_secret") || "",
        user_id: params_parsed.get("user_id") || "",
        screen_name: params_parsed.get("screen_name") || "",
      }
    } catch (error) {
      console.error("Error getting access token:", error)
      throw error
    }
  }

  async getUserInfo(accessToken: string, accessTokenSecret: string): Promise<TwitterUser> {
    const url = "https://api.twitter.com/1.1/account/verify_credentials.json"
    const params = {
      include_email: "true",
    }

    const authHeader = this.generateAuthHeader("GET", url, params, accessTokenSecret, accessToken)

    try {
      const response = await fetch(`${url}?include_email=true`, {
        method: "GET",
        headers: {
          Authorization: authHeader,
        },
      })

      if (!response.ok) {
        throw new Error(`Twitter API error: ${response.status} ${response.statusText}`)
      }

      const user = await response.json()

      return {
        id: user.id_str,
        name: user.name,
        screen_name: user.screen_name,
        profile_image_url: user.profile_image_url_https,
        email: user.email,
      }
    } catch (error) {
      console.error("Error getting user info:", error)
      throw error
    }
  }
}

export const twitterAuth = new TwitterAuth()
