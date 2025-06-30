import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// GET - Fetch user's objectives
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    console.log("📋 Fetching objectives for user:", userId)

    // Get user's objectives with objective details
    const { data: userObjectives, error } = await supabase
      .from("user_objectives")
      .select(`
        *,
        care_objectives (
          id,
          title,
          description,
          category,
          points,
          difficulty,
          estimated_hours
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("❌ Error fetching objectives:", error)
      return NextResponse.json({ error: "Failed to fetch objectives" }, { status: 500 })
    }

    console.log("✅ Objectives fetched:", userObjectives?.length || 0)

    return NextResponse.json({
      objectives: userObjectives || [],
    })
  } catch (error) {
    console.error("💥 Objectives GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PATCH - Update objective status or evidence (user actions only)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { objectiveId, userId, status, evidence } = body

    if (!objectiveId || !userId) {
      return NextResponse.json({ error: "Objective ID and User ID required" }, { status: 400 })
    }

    console.log("📝 Updating objective:", { objectiveId, userId, status, evidence: !!evidence })

    // Validate status transitions (users can only do certain transitions)
    const validUserTransitions = {
      assigned: ["active"],
      active: ["completed"],
      // completed -> verified is admin only (done through Supabase directly)
    }

    // Get current objective
    const { data: currentObjective, error: fetchError } = await supabase
      .from("user_objectives")
      .select("status")
      .eq("id", objectiveId)
      .eq("user_id", userId)
      .single()

    if (fetchError || !currentObjective) {
      console.error("❌ Error fetching current objective:", fetchError)
      return NextResponse.json({ error: "Objective not found" }, { status: 404 })
    }

    // Prepare update data
    const updateData: any = {}

    if (status) {
      // Validate transition
      const allowedTransitions = validUserTransitions[currentObjective.status as keyof typeof validUserTransitions]
      if (!allowedTransitions?.includes(status)) {
        return NextResponse.json(
          { error: `Invalid status transition from ${currentObjective.status} to ${status}` },
          { status: 400 },
        )
      }

      updateData.status = status

      // Set timestamps based on status
      if (status === "active") {
        updateData.started_at = new Date().toISOString()
      } else if (status === "completed") {
        updateData.completed_at = new Date().toISOString()
      }
    }

    if (evidence !== undefined) {
      updateData.evidence = evidence
    }

    // Update the objective
    const { data: updatedObjective, error: updateError } = await supabase
      .from("user_objectives")
      .update(updateData)
      .eq("id", objectiveId)
      .eq("user_id", userId)
      .select(`
        *,
        care_objectives (
          id,
          title,
          description,
          category,
          points,
          difficulty,
          estimated_hours
        )
      `)
      .single()

    if (updateError) {
      console.error("❌ Error updating objective:", updateError)
      return NextResponse.json({ error: "Failed to update objective" }, { status: 500 })
    }

    console.log("✅ Objective updated successfully")

    return NextResponse.json({
      objective: updatedObjective,
      message: "Objective updated successfully",
    })
  } catch (error) {
    console.error("💥 Objectives PATCH error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
