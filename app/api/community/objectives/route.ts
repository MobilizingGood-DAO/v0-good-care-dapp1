import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    let query = supabase.from("care_objectives").select("*")

    if (userId) {
      query = query.eq("assigned_to", userId)
    }

    const { data: objectives, error } = await query.order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching objectives:", error)
      return NextResponse.json({ error: "Failed to fetch objectives" }, { status: 500 })
    }

    return NextResponse.json({ objectives: objectives || [] })
  } catch (error) {
    console.error("Objectives API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { objectiveId, status, evidence_url, assigned_to } = body

    if (!objectiveId) {
      return NextResponse.json({ error: "Objective ID is required" }, { status: 400 })
    }

    const updates: any = {}
    const now = new Date().toISOString()

    if (status) {
      updates.status = status

      if (status === "assigned" && assigned_to) {
        updates.assigned_to = assigned_to
        updates.assigned_at = now
      } else if (status === "active") {
        updates.started_at = now
      } else if (status === "completed") {
        updates.completed_at = now
      } else if (status === "verified") {
        updates.verified_at = now
      }
    }

    if (evidence_url) {
      updates.evidence_url = evidence_url
    }

    const { data, error } = await supabase
      .from("care_objectives")
      .update(updates)
      .eq("id", objectiveId)
      .select()
      .single()

    if (error) {
      console.error("Error updating objective:", error)
      return NextResponse.json({ error: "Failed to update objective" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      objective: data,
      message: "Objective updated successfully",
    })
  } catch (error) {
    console.error("Objectives PATCH API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
