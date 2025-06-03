import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Mock user data for demo
    return NextResponse.json({
      success: true,
      user: {
        id: "demo_user",
        email: "demo@example.com",
        username: "Demo User",
        care_points: 150,
      },
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 })
  }
}
