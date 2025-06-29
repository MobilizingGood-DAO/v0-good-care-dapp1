import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    // Create some demo users for testing
    const demoUsers = [
      { wallet_address: "0x1234567890123456789012345678901234567890", username: "Alice_Care" },
      { wallet_address: "0x2345678901234567890123456789012345678901", username: "Bob_Wellness" },
      { wallet_address: "0x3456789012345678901234567890123456789012", username: "Charlie_Good" },
      { wallet_address: "0x4567890123456789012345678901234567890123", username: "Diana_Health" },
    ]

    for (const userData of demoUsers) {
      // Check if user exists
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("wallet_address", userData.wallet_address)
        .single()

      if (!existingUser) {
        // Create user
        const { data: newUser, error: userError } = await supabase.from("users").insert(userData).select().single()

        if (userError) {
          console.error("Error creating demo user:", userError)
          continue
        }

        // Create some demo check-ins and stats
        const randomPoints = Math.floor(Math.random() * 500) + 100
        const randomStreak = Math.floor(Math.random() * 10) + 1
        const randomCheckins = Math.floor(Math.random() * 20) + 5

        // Insert user stats
        await supabase.from("user_stats").insert({
          user_id: newUser.id,
          total_points: randomPoints,
          current_streak: randomStreak,
          longest_streak: randomStreak + Math.floor(Math.random() * 5),
          level: Math.floor(randomPoints / 100) + 1,
          total_checkins: randomCheckins,
          last_checkin: new Date().toISOString().split("T")[0],
        })

        // Insert some demo check-ins
        for (let i = 0; i < Math.min(randomCheckins, 5); i++) {
          const date = new Date()
          date.setDate(date.getDate() - i)

          await supabase.from("daily_checkins").insert({
            user_id: newUser.id,
            date: date.toISOString().split("T")[0],
            mood: Math.floor(Math.random() * 5) + 1,
            mood_label: ["😢", "😕", "😐", "😊", "😄"][Math.floor(Math.random() * 5)],
            points: Math.floor(Math.random() * 30) + 10,
            streak: Math.floor(Math.random() * 10) + 1,
            gratitude_note: i % 2 === 0 ? "Grateful for this community!" : null,
          })
        }
      }
    }

    return NextResponse.json({ success: true, message: "Demo data seeded" })
  } catch (error) {
    console.error("Seed Error:", error)
    return NextResponse.json({ error: "Failed to seed data" }, { status: 500 })
  }
}
