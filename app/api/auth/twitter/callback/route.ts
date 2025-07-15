import { type NextRequest, NextResponse } from "next/server"
import { twitterAuth } from "@/lib/twitter-auth"
import { avaCloudTwitterService } from "@/lib/avacloud-twitter-integration"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const oauthToken = searchParams.get("oauth_token")
    const oauthVerifier = searchParams.get("oauth_verifier")
    const denied = searchParams.get("denied")

    // Check if user denied access
    if (denied) {
      console.log("User denied Twitter access")
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=access_denied`)
    }

    if (!oauthToken || !oauthVerifier) {
      console.error("Missing OAuth parameters")
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=missing_params`)
    }

    // Get the token secret from the cookie
    const tokenSecret = request.cookies.get("twitter_token_secret")?.value
    if (!tokenSecret) {
      console.error("Missing token secret from cookie")
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=missing_token_secret`)
    }

    console.log("Processing Twitter OAuth callback...")

    // Exchange for access token
    const { token: accessToken, tokenSecret: accessTokenSecret } = await twitterAuth.getAccessToken(
      oauthToken,
      oauthVerifier,
      tokenSecret,
    )

    // Get user info from Twitter
    const twitterUser = await twitterAuth.getUserInfo(accessToken, accessTokenSecret)
    console.log("Twitter user info retrieved:", twitterUser.username)

    // Create embedded wallet with AvaCloud
    const wallet = await avaCloudTwitterService.createEmbeddedWallet(twitterUser)
    console.log("Embedded wallet created:", wallet.address)

    // Store user in Supabase
    const { data: existingUser, error: fetchError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("twitter_id", twitterUser.id)
      .single()

    let userId: string

    if (existingUser) {
      // Update existing user
      const { data: updatedUser, error: updateError } = await supabase
        .from("user_profiles")
        .update({
          username: twitterUser.username,
          display_name: twitterUser.name,
          avatar_url: twitterUser.profile_image_url,
          wallet_address: wallet.address,
          wallet_id: wallet.id,
          last_login: new Date().toISOString(),
        })
        .eq("twitter_id", twitterUser.id)
        .select()
        .single()

      if (updateError) {
        console.error("Error updating user:", updateError)
        throw updateError
      }

      userId = updatedUser.id
    } else {
      // Create new user
      const { data: newUser, error: insertError } = await supabase
        .from("user_profiles")
        .insert({
          twitter_id: twitterUser.id,
          username: twitterUser.username,
          display_name: twitterUser.name,
          avatar_url: twitterUser.profile_image_url,
          wallet_address: wallet.address,
          wallet_id: wallet.id,
          self_care_points: 0,
          community_points: 0,
          current_streak: 0,
          longest_streak: 0,
          total_checkins: 0,
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString(),
        })
        .select()
        .single()

      if (insertError) {
        console.error("Error creating user:", insertError)
        throw insertError
      }

      userId = newUser.id
    }

    // Create session
    const sessionToken = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    const { error: sessionError } = await supabase.from("user_sessions").insert({
      user_id: userId,
      session_token: sessionToken,
      expires_at: expiresAt.toISOString(),
      created_at: new Date().toISOString(),
    })

    if (sessionError) {
      console.error("Error creating session:", sessionError)
      throw sessionError
    }

    // Set session cookie and redirect
    const response = NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`)

    response.cookies.set("session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
    })

    // Clear the temporary token secret cookie
    response.cookies.delete("twitter_token_secret")

    console.log("Twitter authentication successful, redirecting to dashboard")
    return response
  } catch (error) {
    console.error("Error in Twitter OAuth callback:", error)

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=auth_failed`)
  }
}
