import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    // Demo users data
    const demoUsers = [
      {
        wallet_address: "0x1234567890123456789012345678901234567890",
        username: "CareGiver_Alice",
        points: 850,
        streak: 12,
        checkins: 25,
      },
      {
        wallet_address: "0x2345678901234567890123456789012345678901",
        username: "Wellness_Bob",
        points: 720,
        streak: 8,
        checkins: 18,
      },
      {
        wallet_address: "0x3456789012345678901234567890123456789012",
        username: "Mindful_Carol",
        points: 650,
        streak: 15,
        checkins: 22,
      },
      {
        wallet_address: "0x4567890123456789012345678901234567890123",
        username: "Grateful_Dave",
        points: 580,
        streak: 5,
        checkins: 16,
      },
      {
        wallet_address: "0x5678901234567890123456789012345678901234",
        username: "Peaceful_Eve",
        points: 420,
        streak: 3,
        checkins: 12,
      },
    ]

    const results = []

    for (const demoUser of demoUsers) {
      // Check if user already exists
      const { data: existingUser, error: fetchError } = await supabase
        .from("users")
        .select("id")
        .eq("wallet_address", demoUser.wallet_address)
        .single()

      if (fetchError && fetchError.code !== "PGRST116") {
        console.error("Error checking existing user:", fetchError)
        continue
      }

      if (existingUser) {
        results.push({ user: demoUser.username, status: "already exists" })
        continue
      }

      // Create user
      const { data: newUser, error: createError } = await supabase
        .from("users")
        .insert({
          wallet_address: demoUser.wallet_address,
          username: demoUser.username,
        })
        .select()
        .single()

      if (createError) {
        console.error("Error creating demo user:", createError)
        results.push({ user: demoUser.username, status: "failed to create", error: createError.message })
        continue
      }

      // Create user stats
      const level = Math.max(1, Math.floor(demoUser.points / 100) + 1)
      const { error: statsError } = await supabase.from("user_stats").insert({
        user_id: newUser.id,
        total_points: demoUser.points,
        current_streak: demoUser.streak,
        longest_streak: demoUser.streak,
        level: level,
        total_checkins: demoUser.checkins,
        last_checkin: new Date().toISOString().split("T")[0],
      })

      if (statsError) {
        console.error("Error creating demo user stats:", statsError)
        results.push({ user: demoUser.username, status: "user created but stats failed", error: statsError.message })
        continue
      }

      // Create some demo check-ins
      const checkInPromises = []
      for (let i = 0; i < Math.min(demoUser.checkins, 5); i++) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split("T")[0]

        checkInPromises.push(
          supabase.from("daily_checkins").insert({
            user_id: newUser.id,
            date: dateStr,
            mood: Math.floor(Math.random() * 5) + 1,
            mood_label: ["😢", "😕", "😐", "😊", "😄"][Math.floor(Math.random() * 5)],
            points: 10 + (Math.random() > 0.5 ? 5 : 0), // Random gratitude bonus
            streak: Math.max(1, demoUser.streak - i),
            gratitude_note: Math.random() > 0.5 ? "Grateful for this community!" : null,
          }),
        )
      }

      await Promise.all(checkInPromises)

      results.push({ user: demoUser.username, status: "created successfully" })
    }

    return NextResponse.json({
      success: true,
      message: "Demo data seeding completed",
      results: results,
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
