import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    console.log("🎯 API: Fetching care objectives...")

    const { data: objectives, error } = await supabase
      .from("care_objectives")
      .select(`
        id,
        title,
        description,
        category,
        points_value,
        difficulty_level,
        is_active,
        created_at
      `)
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("❌ Error fetching objectives:", error)
      throw error
    }

    console.log(`✅ API: Found ${objectives?.length || 0} active objectives`)

    return NextResponse.json({
      objectives: objectives || [],
      success: true,
    })
  } catch (error) {
    console.error("❌ API: Error in objectives GET route:", error)
    return NextResponse.json(
      {
        objectives: [],
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch objectives",
      },
      { status: 500 },
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { objectiveId, userId, status, evidence, completedAt } = body

    console.log("🎯 API: Updating objective:", objectiveId, "for user:", userId)

    if (!objectiveId || !userId) {
      return NextResponse.json({ error: "Missing required fields: objectiveId and userId" }, { status: 400 })
    }

    // Update or insert user objective progress
    const { data: progress, error: progressError } = await supabase
      .from("user_objective_progress")
      .upsert({
        user_id: userId,
        objective_id: objectiveId,
        status: status || "in_progress",
        evidence_text: evidence,
        completed_at: completedAt ? new Date(completedAt).toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (progressError) {
      console.error("❌ Error updating objective progress:", progressError)
      throw progressError
    }

    // If objective is completed and verified, award points
    if (status === "completed" && completedAt) {
      // Get objective details for points
      const { data: objective, error: objError } = await supabase
        .from("care_objectives")
        .select("points_value")
        .eq("id", objectiveId)
        .single()

      if (!objError && objective) {
        // Update user's community points
        const { error: pointsError } = await supabase.rpc("increment_community_points", {
          user_id: userId,
          points_to_add: objective.points_value || 25,
        })

        if (pointsError) {
          console.error("❌ Error updating community points:", pointsError)
        } else {
          console.log(`✅ Awarded ${objective.points_value} community points to user ${userId}`)
        }
      }
    }

    console.log("✅ API: Objective updated successfully")

    return NextResponse.json({
      success: true,
      message: "Objective updated successfully",
      data: progress,
    })
  } catch (error) {
    console.error("❌ API: Error in objectives PATCH route:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update objective",
      },
      { status: 500 },
    )
  }
}
