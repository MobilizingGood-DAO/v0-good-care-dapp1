import { type NextRequest, NextResponse } from "next/server"
import { avaCloudTwitter } from "@/lib/avacloud-twitter-integration"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const oauthToken = searchParams.get("oauth_token")
    const oauthVerifier = searchParams.get("oauth_verifier")
    const denied = searchParams.get("denied")

    // Check if user denied access
    if (denied) {
      console.log("User denied Twitter access")
      return NextResponse.redirect(new URL("/login?error=access_denied", request.url))
    }

    if (!oauthToken || !oauthVerifier) {
      console.error("Missing OAuth parameters")
      return NextResponse.redirect(new URL("/login?error=invalid_request", request.url))
    }

    // Get state from cookie
    const state = request.cookies.get("twitter_oauth_state")?.value
    if (!state) {
      console.error("Missing OAuth state")
      return NextResponse.redirect(new URL("/login?error=invalid_state", request.url))
    }

    console.log("Processing Twitter callback...")

    // Handle callback and create wallet
    const result = await avaCloudTwitter.handleTwitterCallback(oauthToken, oauthVerifier, state)

    if (!result.success) {
      console.error("Twitter authentication failed:", result.error)
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(result.error || "auth_failed")}`, request.url),
      )
    }

    console.log("Twitter authentication successful:", result.user?.username)

    // Create session/JWT token here if needed
    const response = NextResponse.redirect(new URL("/dashboard", request.url))

    // Store user data in cookie (in production, use proper session management)
    response.cookies.set(
      "user_session",
      JSON.stringify({
        id: result.user?.id,
        username: result.user?.username,
        name: result.user?.name,
        walletAddress: result.wallet?.address,
        provider: "twitter",
        loginTime: Date.now(),
      }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 86400 * 7, // 7 days
      },
    )

    // Clear OAuth state cookie
    response.cookies.delete("twitter_oauth_state")

    return response
  } catch (error) {
    console.error("Twitter callback error:", error)
    return NextResponse.redirect(new URL("/login?error=server_error", request.url))
  }
}
