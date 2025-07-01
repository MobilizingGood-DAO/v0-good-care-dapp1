import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, mood, gratitude, isPublic } = body

    if (!userId || !mood) {
      return NextResponse.json({ error: "User ID and mood are required" }, { status: 400 })
    }

    const today = new Date().toISOString().split("T")[0]

    // Check if user already checked in today
    const { data: existingCheckin } = await supabase
      .from("daily_checkins")
      .select("id")
      .eq("user_id", userId)
      .eq("checkin_date", today)
      .single()

    if (existingCheckin) {
      return NextResponse.json({ error: "Already checked in today" }, { status: 400 })
    }

    // Calculate points
    let points = 10 // Base points for checking in
    if (gratitude && gratitude.trim().length > 0) {
      points += 5 // Bonus for gratitude
    }

    // Calculate streak
    const { data: recentCheckins } = await supabase
      .from("daily_checkins")
      .select("checkin_date")
      .eq("user_id", userId)
      .order("checkin_date", { ascending: false })
      .limit(30)

    let streak = 1
    if (recentCheckins && recentCheckins.length > 0) {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split("T")[0]

      if (recentCheckins[0].checkin_date === yesterdayStr) {
        // Continue streak
        let consecutiveDays = 1
        for (let i = 1; i < recentCheckins.length; i++) {
          const expectedDate = new Date()
          expectedDate.setDate(expectedDate.getDate() - (i + 1))
          const expectedDateStr = expectedDate.toISOString().split("T")[0]

          if (recentCheckins[i].checkin_date === expectedDateStr) {
            consecutiveDays++
          } else {
            break
          }
        }
        streak = consecutiveDays + 1
      }
    }

    // Add streak bonus (up to 10 points)
    const streakBonus = Math.min(streak - 1, 10)
    points += streakBonus

    // Insert checkin
    const { data: checkin, error: checkinError } = await supabase
      .from("daily_checkins")
      .insert({
        user_id: userId,
        mood: Number.parseInt(mood),
        gratitude: gratitude || null,
        is_public: isPublic || false,
        points,
        streak,
        checkin_date: today,
      })
      .select()
      .single()

    if (checkinError) {
      console.error("Error inserting checkin:", checkinError)
      return NextResponse.json({ error: "Failed to save check-in" }, { status: 500 })
    }

    // Ensure user profile exists
    const { data: profile } = await supabase.from("user_profiles").select("id").eq("user_id", userId).single()

    if (!profile) {
      // Create user profile if it doesn't exist
      await supabase.from("user_profiles").insert({
        user_id: userId,
        username: `User${Date.now()}`,
        total_points: points,
        current_streak: streak,
        max_streak: streak,
        total_checkins: 1,
        last_checkin_date: today,
      })
    }

    return NextResponse.json({
      success: true,
      checkin,
      points,
      streak,
      message: `Check-in successful! Earned ${points} points. Current streak: ${streak} days.`,
    })
  } catch (error) {
    console.error("Checkin API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    // Get user's check-in history
    const { data: checkins, error } = await supabase
      .from("daily_checkins")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(30)

    if (error) {
      console.error("Error fetching check-ins:", error)
      return NextResponse.json({ error: "Failed to fetch check-ins" }, { status: 500 })
    }

    // Check if user has checked in today
    const today = new Date().toISOString().split("T")[0]

    const todayCheckin = checkins?.find((checkin) => checkin.checkin_date === today)

    return NextResponse.json({
      checkins: checkins || [],
      hasCheckedInToday: !!todayCheckin,
      todayCheckin,
    })
  } catch (error) {
    console.error("Check-in GET API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
