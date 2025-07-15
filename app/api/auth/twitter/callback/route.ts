import { type NextRequest, NextResponse } from "next/server"
import { twitterAuth } from "@/lib/twitter-auth"
import { avaCloudTwitterIntegration } from "@/lib/avacloud-twitter-integration"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const oauthToken = searchParams.get("oauth_token")
    const oauthVerifier = searchParams.get("oauth_verifier")
    const denied = searchParams.get("denied")

    console.log("Twitter callback received:", { oauthToken, oauthVerifier, denied })

    // Check if user denied access
    if (denied) {
      console.log("User denied Twitter access")
      return NextResponse.redirect(new URL("/login?error=access_denied", request.url))
    }

    // Validate required parameters
    if (!oauthToken || !oauthVerifier) {
      console.error("Missing required OAuth parameters")
      return NextResponse.redirect(new URL("/login?error=invalid_request", request.url))
    }

    // Get stored token secret from cookies
    const tokenSecret = request.cookies.get("twitter_oauth_token_secret")?.value
    const storedToken = request.cookies.get("twitter_oauth_token")?.value

    if (!tokenSecret || !storedToken || storedToken !== oauthToken) {
      console.error("Invalid or missing token secret")
      return NextResponse.redirect(new URL("/login?error=invalid_token", request.url))
    }

    // Exchange for access token
    console.log("Exchanging for access token...")
    const accessToken = await twitterAuth.getAccessToken(oauthToken, tokenSecret, oauthVerifier)

    console.log("Got access token for user:", accessToken.screen_name)

    // Get user information
    const twitterUser = await twitterAuth.getUserInfo(accessToken.oauth_token, accessToken.oauth_token_secret)

    console.log("Got Twitter user info:", twitterUser.screen_name)

    // Process login with AvaCloud integration
    const userProfile = await avaCloudTwitterIntegration.processTwitterLogin(twitterUser)

    console.log("Processed Twitter login, created user profile:", userProfile.id)

    // Create session
    const response = NextResponse.redirect(new URL("/dashboard", request.url))

    // Set session cookie
    response.cookies.set(
      "user_session",
      JSON.stringify({
        userId: userProfile.id,
        twitterId: userProfile.twitter_id,
        username: userProfile.username,
        displayName: userProfile.display_name,
        avatarUrl: userProfile.avatar_url,
        walletAddress: userProfile.wallet_address,
        walletId: userProfile.wallet_id,
      }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      },
    )

    // Clear OAuth cookies
    response.cookies.delete("twitter_oauth_token_secret")
    response.cookies.delete("twitter_oauth_token")

    return response
  } catch (error) {
    console.error("Error in Twitter OAuth callback:", error)
    return NextResponse.redirect(new URL("/login?error=oauth_error", request.url))
  }
}
