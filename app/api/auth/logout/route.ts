import { type NextRequest, NextResponse } from "next/server"
import { logout } from "@/lib/auth-service"

export async function POST(request: NextRequest) {
  try {
    const authToken = request.cookies.get("auth_token")?.value

    if (authToken) {
      await logout(authToken)
    }

    const response = NextResponse.json({ success: true })
    response.cookies.delete("auth_token")

    return response
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
