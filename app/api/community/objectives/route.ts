import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// GET - Fetch user's care objectives
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const status = searchParams.get("status") || "completed"

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("care_objectives")
      .select("*")
      .eq("user_id", userId)
      .eq("status", status)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching objectives:", error)
      return NextResponse.json({ error: "Failed to fetch objectives" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      objectives: data || [],
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Create new care objective
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, username, walletAddress, objectiveType, title, description, points, evidenceUrl } = body

    if (!userId || !username || !walletAddress || !objectiveType || !title || !points) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("care_objectives")
      .insert({
        user_id: userId,
        username,
        wallet_address: walletAddress,
        objective_type: objectiveType,
        title,
        description,
        points,
        evidence_url: evidenceUrl,
        status: "pending", // Requires verification
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating objective:", error)
      return NextResponse.json({ error: "Failed to create objective" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      objective: data,
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
