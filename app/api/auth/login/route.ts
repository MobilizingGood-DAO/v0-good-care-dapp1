import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Mock authentication for demo
    if (email && password) {
      return NextResponse.json({
        success: true,
        user: {
          id: `user_${Date.now()}`,
          email,
          username: email.split("@")[0],
        },
      })
    }

    return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 })
  }
}
