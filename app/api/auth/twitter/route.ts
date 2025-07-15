import { type NextRequest, NextResponse } from "next/server"
import { twitterAuth } from "@/lib/twitter-auth"

export async function GET(request: NextRequest) {
  try {
    console.log("Initiating Twitter OAuth flow...")

    const { token, tokenSecret, authUrl } = await twitterAuth.getRequestToken()

    // Store the token secret in a secure cookie for the callback
    const response = NextResponse.redirect(authUrl)
    response.cookies.set("twitter_token_secret", tokenSecret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600, // 10 minutes
    })

    console.log("Twitter OAuth initiated, redirecting to:", authUrl)
    return response
  } catch (error) {
    console.error("Error initiating Twitter OAuth:", error)

    return NextResponse.json({ error: "Failed to initiate Twitter authentication" }, { status: 500 })
  }
}
