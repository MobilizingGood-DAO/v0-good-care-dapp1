import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const status = searchParams.get("status") || "all"

    let query = supabase.from("care_objectives").select("*")

    if (userId) {
      query = query.eq("user_id", userId)
    }

    if (status !== "all") {
      query = query.eq("status", status)
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      objectives: data || [],
    })
  } catch (error) {
    console.error("Error fetching objectives:", error)
    return NextResponse.json({ error: "Failed to fetch objectives" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, username, walletAddress, objectiveType, title, description, points, category, evidenceUrl } = body

    if (!userId || !username || !title || !points) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("care_objectives")
      .insert({
        user_id: userId,
        username,
        wallet_address: walletAddress,
        objective_type: objectiveType || "community",
        title,
        description,
        points,
        category: category || "general",
        evidence_url: evidenceUrl,
        status: "pending",
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      objective: data,
    })
  } catch (error) {
    console.error("Error creating objective:", error)
    return NextResponse.json({ error: "Failed to create objective" }, { status: 500 })
  }
}
