import { type NextRequest, NextResponse } from "next/server"
import { twitterAuth } from "@/lib/twitter-auth"

export async function GET(request: NextRequest) {
  try {
    console.log("Starting Twitter OAuth flow...")

    const { token, tokenSecret, authUrl } = await twitterAuth.getRequestToken()

    console.log("Got request token:", { token, authUrl })

    // Store the token secret in a secure cookie for the callback
    const response = NextResponse.redirect(authUrl)
    response.cookies.set("twitter_token_secret", tokenSecret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600, // 10 minutes
    })

    return response
  } catch (error) {
    console.error("Twitter OAuth initiation error:", error)

    const errorUrl = new URL("/login", request.url)
    errorUrl.searchParams.set("error", "twitter_oauth_failed")

    return NextResponse.redirect(errorUrl)
  }
}
