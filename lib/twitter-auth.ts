import crypto from "crypto"

interface TwitterOAuthConfig {
  consumerKey: string
  consumerSecret: string
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
      consumerKey: process.env.TWITTER_API_KEY || "870vfO8m4SvC2eZjl4cBxvVBo",
      consumerSecret: process.env.TWITTER_API_KEY_SECRET || "exuCGhtUhVe9tYE1psdwozjIZWLmmpFFh7inVmmqP7Ia0YVbRW",
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

  private generateSignature(method: string, url: string, params: Record<string, string>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => `${this.percentEncode(key)}=${this.percentEncode(params[key])}`)
      .join("&")

    const signatureBaseString = `${method}&${this.percentEncode(url)}&${this.percentEncode(sortedParams)}`
    const signingKey = `${this.percentEncode(this.config.consumerSecret)}&${this.percentEncode(this.config.accessTokenSecret)}`

    return crypto.createHmac("sha1", signingKey).update(signatureBaseString).digest("base64")
  }

  private generateAuthHeader(method: string, url: string, additionalParams: Record<string, string> = {}): string {
    const oauthParams = {
      oauth_consumer_key: this.config.consumerKey,
      oauth_nonce: this.generateNonce(),
      oauth_signature_method: "HMAC-SHA1",
      oauth_timestamp: this.generateTimestamp(),
      oauth_token: this.config.accessToken,
      oauth_version: "1.0",
      ...additionalParams,
    }

    const signature = this.generateSignature(method, url, oauthParams)
    oauthParams.oauth_signature = signature

    const authHeader =
      "OAuth " +
      Object.keys(oauthParams)
        .sort()
        .map((key) => `${this.percentEncode(key)}="${this.percentEncode(oauthParams[key])}"`)
        .join(", ")

    return authHeader
  }

  async getRequestToken(): Promise<{ token: string; tokenSecret: string; authUrl: string }> {
    const url = "https://api.twitter.com/oauth/request_token"
    const params = {
      oauth_callback: this.config.callbackUrl,
      oauth_consumer_key: this.config.consumerKey,
      oauth_nonce: this.generateNonce(),
      oauth_signature_method: "HMAC-SHA1",
      oauth_timestamp: this.generateTimestamp(),
      oauth_version: "1.0",
    }

    const signature = this.generateSignature("POST", url, params)
    const authHeader = `OAuth oauth_callback="${this.percentEncode(this.config.callbackUrl)}", oauth_consumer_key="${this.config.consumerKey}", oauth_nonce="${params.oauth_nonce}", oauth_signature="${this.percentEncode(signature)}", oauth_signature_method="HMAC-SHA1", oauth_timestamp="${params.oauth_timestamp}", oauth_version="1.0"`

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

      const responseText = await response.text()
      const params_parsed = new URLSearchParams(responseText)

      const token = params_parsed.get("oauth_token")
      const tokenSecret = params_parsed.get("oauth_token_secret")

      if (!token || !tokenSecret) {
        throw new Error("Failed to get request token from Twitter")
      }

      return {
        token,
        tokenSecret,
        authUrl: `https://api.twitter.com/oauth/authenticate?oauth_token=${token}`,
      }
    } catch (error) {
      console.error("Error getting Twitter request token:", error)
      throw error
    }
  }

  async getAccessToken(
    oauthToken: string,
    oauthVerifier: string,
    tokenSecret: string,
  ): Promise<{ token: string; tokenSecret: string }> {
    const url = "https://api.twitter.com/oauth/access_token"
    const params = {
      oauth_consumer_key: this.config.consumerKey,
      oauth_nonce: this.generateNonce(),
      oauth_signature_method: "HMAC-SHA1",
      oauth_timestamp: this.generateTimestamp(),
      oauth_token: oauthToken,
      oauth_verifier: oauthVerifier,
      oauth_version: "1.0",
    }

    // Use the request token secret for signing
    const tempConfig = { ...this.config, accessTokenSecret: tokenSecret }
    const signingKey = `${this.percentEncode(tempConfig.consumerSecret)}&${this.percentEncode(tokenSecret)}`

    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => `${this.percentEncode(key)}=${this.percentEncode(params[key])}`)
      .join("&")

    const signatureBaseString = `POST&${this.percentEncode(url)}&${this.percentEncode(sortedParams)}`
    const signature = crypto.createHmac("sha1", signingKey).update(signatureBaseString).digest("base64")

    const authHeader = `OAuth oauth_consumer_key="${this.config.consumerKey}", oauth_nonce="${params.oauth_nonce}", oauth_signature="${this.percentEncode(signature)}", oauth_signature_method="HMAC-SHA1", oauth_timestamp="${params.oauth_timestamp}", oauth_token="${oauthToken}", oauth_verifier="${oauthVerifier}", oauth_version="1.0"`

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

      const responseText = await response.text()
      const params_parsed = new URLSearchParams(responseText)

      const token = params_parsed.get("oauth_token")
      const newTokenSecret = params_parsed.get("oauth_token_secret")

      if (!token || !newTokenSecret) {
        throw new Error("Failed to get access token from Twitter")
      }

      return { token, tokenSecret: newTokenSecret }
    } catch (error) {
      console.error("Error getting Twitter access token:", error)
      throw error
    }
  }

  async getUserInfo(accessToken: string, accessTokenSecret: string): Promise<TwitterUser> {
    const url = "https://api.twitter.com/1.1/account/verify_credentials.json"

    // Create temporary config with user's tokens
    const tempConfig = { ...this.config, accessToken, accessTokenSecret }
    const authHeader = this.generateAuthHeaderWithTokens("GET", url, accessToken, accessTokenSecret)

    try {
      const response = await fetch(url, {
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
      console.error("Error getting Twitter user info:", error)
      throw error
    }
  }

  private generateAuthHeaderWithTokens(
    method: string,
    url: string,
    accessToken: string,
    accessTokenSecret: string,
  ): string {
    const oauthParams = {
      oauth_consumer_key: this.config.consumerKey,
      oauth_nonce: this.generateNonce(),
      oauth_signature_method: "HMAC-SHA1",
      oauth_timestamp: this.generateTimestamp(),
      oauth_token: accessToken,
      oauth_version: "1.0",
    }

    const sortedParams = Object.keys(oauthParams)
      .sort()
      .map((key) => `${this.percentEncode(key)}=${this.percentEncode(oauthParams[key])}`)
      .join("&")

    const signatureBaseString = `${method}&${this.percentEncode(url)}&${this.percentEncode(sortedParams)}`
    const signingKey = `${this.percentEncode(this.config.consumerSecret)}&${this.percentEncode(accessTokenSecret)}`

    const signature = crypto.createHmac("sha1", signingKey).update(signatureBaseString).digest("base64")

    return `OAuth oauth_consumer_key="${this.config.consumerKey}", oauth_nonce="${oauthParams.oauth_nonce}", oauth_signature="${this.percentEncode(signature)}", oauth_signature_method="HMAC-SHA1", oauth_timestamp="${oauthParams.oauth_timestamp}", oauth_token="${accessToken}", oauth_version="1.0"`
  }
}

export const twitterAuth = new TwitterAuthService()
