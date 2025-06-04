import { type NextRequest, NextResponse } from "next/server"
import { createOrGetUserByEmail, createOrGetUserBySocial, createSession } from "@/lib/auth-service"
import { loginWithEmail, loginWithSocial } from "@/lib/avacloud-waas"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { method, email, provider, socialId } = body

    let user
    let walletResult

    if (method === "email" && email) {
      // Create wallet with AvaCloud
      walletResult = await loginWithEmail(email)

      if (!walletResult.success) {
        return NextResponse.json({ error: "Failed to create wallet" }, { status: 500 })
      }

      // Create or get user
      user = await createOrGetUserByEmail(email, walletResult.address)
    } else if (method === "social" && provider && socialId) {
      // Create wallet with AvaCloud
      walletResult = await loginWithSocial(provider)

      if (!walletResult.success) {
        return NextResponse.json({ error: "Failed to create wallet" }, { status: 500 })
      }

      // Create or get user
      user = await createOrGetUserBySocial(provider, socialId, email, walletResult.address)
    } else {
      return NextResponse.json({ error: "Invalid login method or missing parameters" }, { status: 400 })
    }

    // Create session
    const session = await createSession(user)

    // Set session cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        walletAddress: user.walletAddress,
        socialProvider: user.socialProvider,
      },
    })

    response.cookies.set("auth_token", session.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 hours
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
