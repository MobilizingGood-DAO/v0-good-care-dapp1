import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth-service"

export async function GET(request: NextRequest) {
  try {
    const authToken = request.cookies.get("auth_token")?.value

    if (!authToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const session = await getSession(authToken)

    if (!session) {
      return NextResponse.json({ error: "Invalid or expired session" }, { status: 401 })
    }

    return NextResponse.json({
      user: {
        id: session.user.id,
        email: session.user.email,
        walletAddress: session.user.walletAddress,
        socialProvider: session.user.socialProvider,
      },
    })
  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
