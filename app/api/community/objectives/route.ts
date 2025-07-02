import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  console.log("🎯 API: Fetching care objectives...")

  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "Missing userId parameter" }, { status: 400 })
    }

    // Fetch user's care objectives
    const { data: objectives, error } = await supabase
      .from("care_objectives")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("❌ Error fetching objectives:", error)
      throw error
    }

    console.log("✅ Fetched objectives:", objectives?.length || 0)

    return NextResponse.json({
      objectives: objectives || [],
    })
  } catch (error) {
    console.error("❌ API: Objectives fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch objectives" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  console.log("🎯 API: Updating care objective...")

  try {
    const body = await request.json()
    const { objectiveId, status, evidence, userId } = body

    if (!objectiveId || !status) {
      return NextResponse.json({ error: "Missing required fields: objectiveId, status" }, { status: 400 })
    }

    // Update objective
    const { data: objective, error: updateError } = await supabase
      .from("care_objectives")
      .update({
        status,
        evidence: evidence || null,
        completed_at: status === "completed" ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", objectiveId)
      .select()
      .single()

    if (updateError) {
      console.error("❌ Error updating objective:", updateError)
      throw updateError
    }

    // If objective is completed and verified, award community points
    if (status === "verified" && objective && userId) {
      const pointsToAward = objective.points_value || 50

      const { error: pointsError } = await supabase
        .from("user_profiles")
        .update({
          community_points: supabase.raw(`community_points + ${pointsToAward}`),
        })
        .eq("id", userId)

      if (pointsError) {
        console.error("❌ Error awarding points:", pointsError)
      } else {
        console.log("✅ Awarded community points:", pointsToAward)
      }
    }

    console.log("✅ Objective updated successfully:", {
      objectiveId,
      status,
      pointsAwarded: status === "verified" ? objective.points_value : 0,
    })

    return NextResponse.json({
      success: true,
      objective,
      pointsAwarded: status === "verified" ? objective.points_value || 0 : 0,
    })
  } catch (error) {
    console.error("❌ API: Objective update error:", error)
    return NextResponse.json({ error: "Failed to update objective" }, { status: 500 })
  }
}
