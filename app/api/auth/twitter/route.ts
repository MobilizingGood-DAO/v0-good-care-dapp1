import { type NextRequest, NextResponse } from "next/server"
import { avaCloudTwitter } from "@/lib/avacloud-twitter-integration"

export async function GET(request: NextRequest) {
  try {
    console.log("Initiating Twitter OAuth flow...")

    const authData = await avaCloudTwitter.getTwitterAuthUrl()

    // Store state in cookie for security
    const response = NextResponse.redirect(authData.url)
    response.cookies.set("twitter_oauth_state", authData.state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600, // 10 minutes
    })

    return response
  } catch (error) {
    console.error("Twitter auth initiation error:", error)
    return NextResponse.json({ error: "Failed to initiate Twitter authentication" }, { status: 500 })
  }
}
