import { type NextRequest, NextResponse } from "next/server"
import { twitterAuth } from "@/lib/twitter-auth"

export async function GET(request: NextRequest) {
  try {
    console.log("Initiating Twitter OAuth flow...")

    // Get request token from Twitter
    const requestToken = await twitterAuth.getRequestToken()

    console.log("Got request token:", requestToken.oauth_token)

    // Store request token secret in session (using cookies for simplicity)
    const response = NextResponse.redirect(twitterAuth.getAuthorizationUrl(requestToken.oauth_token))

    response.cookies.set("twitter_oauth_token_secret", requestToken.oauth_token_secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 15, // 15 minutes
    })

    response.cookies.set("twitter_oauth_token", requestToken.oauth_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 15, // 15 minutes
    })

    return response
  } catch (error) {
    console.error("Error in Twitter OAuth initiation:", error)
    return NextResponse.json({ error: "Failed to initiate Twitter OAuth" }, { status: 500 })
  }
}
