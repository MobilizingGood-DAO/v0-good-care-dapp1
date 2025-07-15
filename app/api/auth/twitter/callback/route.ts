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

    console.log("Twitter callback received:", { oauthToken, oauthVerifier, denied })

    if (denied) {
      console.log("User denied Twitter authorization")
      const errorUrl = new URL("/login", request.url)
      errorUrl.searchParams.set("error", "twitter_denied")
      return NextResponse.redirect(errorUrl)
    }

    if (!oauthToken || !oauthVerifier) {
      console.error("Missing OAuth parameters")
      const errorUrl = new URL("/login", request.url)
      errorUrl.searchParams.set("error", "missing_oauth_params")
      return NextResponse.redirect(errorUrl)
    }

    // Get the token secret from the cookie
    const tokenSecret = request.cookies.get("twitter_token_secret")?.value
    if (!tokenSecret) {
      console.error("Missing token secret from cookie")
      const errorUrl = new URL("/login", request.url)
      errorUrl.searchParams.set("error", "missing_token_secret")
      return NextResponse.redirect(errorUrl)
    }

    console.log("Getting access token...")
    const accessTokenData = await twitterAuth.getAccessToken(oauthToken, tokenSecret, oauthVerifier)

    console.log("Getting user info...")
    const twitterUser = await twitterAuth.getUserInfo(accessTokenData.token, accessTokenData.tokenSecret)

    console.log("Twitter user data:", twitterUser)

    // Create embedded wallet with AvaCloud
    console.log("Creating embedded wallet...")
    const wallet = await avaCloudTwitterService.createEmbeddedWallet(twitterUser)

    console.log("Wallet created:", wallet)

    // Store user in Supabase
    const { data: existingUser, error: fetchError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("twitter_id", twitterUser.id)
      .single()

    let userData
    if (existingUser) {
      // Update existing user
      const { data, error } = await supabase
        .from("user_profiles")
        .update({
          username: twitterUser.username,
          display_name: twitterUser.name,
          avatar_url: twitterUser.profile_image_url,
          wallet_address: wallet.address,
          updated_at: new Date().toISOString(),
        })
        .eq("twitter_id", twitterUser.id)
        .select()
        .single()

      if (error) {
        console.error("Error updating user:", error)
        throw error
      }
      userData = data
    } else {
      // Create new user
      const { data, error } = await supabase
        .from("user_profiles")
        .insert({
          twitter_id: twitterUser.id,
          username: twitterUser.username,
          display_name: twitterUser.name,
          email: twitterUser.email,
          avatar_url: twitterUser.profile_image_url,
          wallet_address: wallet.address,
          self_care_points: 0,
          community_points: 0,
          streak_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        console.error("Error creating user:", error)
        throw error
      }
      userData = data
    }

    console.log("User stored in Supabase:", userData)

    // Create session
    const response = NextResponse.redirect(new URL("/dashboard", request.url))

    // Set session cookie
    response.cookies.set(
      "user_session",
      JSON.stringify({
        id: userData.id,
        twitter_id: twitterUser.id,
        username: twitterUser.username,
        display_name: twitterUser.name,
        wallet_address: wallet.address,
      }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 86400 * 7, // 7 days
      },
    )

    // Clear the temporary token secret cookie
    response.cookies.delete("twitter_token_secret")

    return response
  } catch (error) {
    console.error("Twitter callback error:", error)

    const errorUrl = new URL("/login", request.url)
    errorUrl.searchParams.set("error", "twitter_callback_failed")

    return NextResponse.redirect(errorUrl)
  }
}
