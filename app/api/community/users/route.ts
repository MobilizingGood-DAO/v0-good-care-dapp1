import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, username } = await request.json()

    if (!walletAddress) {
      return NextResponse.json({ error: "Wallet address is required" }, { status: 400 })
    }

    // Check if user already exists
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("wallet_address", walletAddress)
      .single()

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error fetching user:", fetchError)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    if (existingUser) {
      // Update username if provided
      if (username && username !== existingUser.username) {
        const { data: updatedUser, error: updateError } = await supabase
          .from("users")
          .update({ username, updated_at: new Date().toISOString() })
          .eq("id", existingUser.id)
          .select()
          .single()

        if (updateError) {
          console.error("Error updating user:", updateError)
          return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
        }

        return NextResponse.json({ success: true, user: updatedUser })
      }

      return NextResponse.json({ success: true, user: existingUser })
    }

    // Create new user
    const { data: newUser, error: createError } = await supabase
      .from("users")
      .insert({
        wallet_address: walletAddress,
        username: username || `User_${walletAddress.slice(-6)}`,
      })
      .select()
      .single()

    if (createError) {
      console.error("Error creating user:", createError)
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }

    // Initialize user stats
    const { error: statsError } = await supabase.from("user_stats").insert({
      user_id: newUser.id,
      total_points: 0,
      current_streak: 0,
      longest_streak: 0,
      level: 1,
      total_checkins: 0,
    })

    if (statsError) {
      console.error("Error creating user stats:", statsError)
      // Don't fail the user creation, just log the error
    }

    return NextResponse.json({ success: true, user: newUser })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
