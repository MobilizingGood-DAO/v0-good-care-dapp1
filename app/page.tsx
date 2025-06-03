"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { Heart, Users, Trophy, TrendingUp, Wallet, Loader2, User, LogOut, Send } from "lucide-react"

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loginLoading, setLoginLoading] = useState(false)
  const [selectedMood, setSelectedMood] = useState<number | null>(null)
  const [gratitudeNote, setGratitudeNote] = useState("")
  const [checkInLoading, setCheckInLoading] = useState(false)
  const [sendAmount, setSendAmount] = useState("")
  const [sendAddress, setSendAddress] = useState("")
  const { toast } = useToast()

  // Check for existing session on load
  useEffect(() => {
    async function checkSession() {
      try {
        const { data } = await supabase.auth.getSession()
        if (data.session?.user) {
          const { data: userData } = await supabase.from("users").select("*").eq("id", data.session.user.id).single()

          setUser(
            userData || {
              id: data.session.user.id,
              email: data.session.user.email,
              username: data.session.user.email?.split("@")[0] || "User",
              care_points: 0,
              created_at: new Date().toISOString(),
            },
          )
        }
      } catch (error) {
        console.error("Error checking session:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()
  }, [])

  // Sign in function
  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setLoginLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        const { data: userData } = await supabase.from("users").select("*").eq("id", data.user.id).single()

        setUser(
          userData || {
            id: data.user.id,
            email: data.user.email,
            username: data.user.email?.split("@")[0] || "User",
            care_points: 0,
            created_at: new Date().toISOString(),
          },
        )

        toast({
          title: "Welcome back!",
          description: "You've successfully signed in.",
        })
      }
    } catch (error: any) {
      toast({
        title: "Error signing in",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoginLoading(false)
    }
  }

  // Sign up function
  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setLoginLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) throw error

      toast({
        title: "Account created!",
        description: "Please check your email to verify your account.",
      })
    } catch (error: any) {
      toast({
        title: "Error signing up",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoginLoading(false)
    }
  }

  // Sign out function
  async function handleSignOut() {
    await supabase.auth.signOut()
    setUser(null)
    toast({
      title: "Signed out",
      description: "You've been successfully signed out.",
    })
  }

  // Demo login
  async function handleDemoLogin() {
    setLoginLoading(true)

    try {
      const demoUser = {
        id: `demo-${Math.random().toString(36).substring(2, 9)}`,
        email: `demo-${Math.random().toString(36).substring(2, 9)}@goodcare.demo`,
        username: "Demo User",
        care_points: Math.floor(Math.random() * 500),
        created_at: new Date().toISOString(),
        wallet_address: `0x${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`,
      }

      setUser(demoUser)

      toast({
        title: "Demo mode activated",
        description: "You're now using GOOD CARE in demo mode.",
      })
    } catch (error) {
      console.error("Demo login error:", error)
      toast({
        title: "Error",
        description: "Failed to start demo mode",
        variant: "destructive",
      })
    } finally {
      setLoginLoading(false)
    }
  }

  // Handle check-in submission
  async function handleCheckIn() {
    if (!selectedMood) return

    setCheckInLoading(true)

    try {
      const points = Math.floor(Math.random() * 20) + 10

      setUser((prev) => ({
        ...prev,
        care_points: (prev.care_points || 0) + points,
      }))

      toast({
        title: "Check-in recorded!",
        description: `You earned ${points} CARE Points!`,
      })

      setSelectedMood(null)
      setGratitudeNote("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record check-in",
        variant: "destructive",
      })
    } finally {
      setCheckInLoading(false)
    }
  }

  // Handle token send
  async function handleSendTokens() {
    if (!sendAmount || !sendAddress) return

    try {
      toast({
        title: "Tokens sent!",
        description: `Sent ${sendAmount} CARE tokens to ${sendAddress.slice(0, 6)}...${sendAddress.slice(-4)}`,
      })

      setSendAmount("")
      setSendAddress("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send tokens",
        variant: "destructive",
      })
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center space-y-4">
          <div className="text-6xl">🌱</div>
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-lg">Loading GOOD CARE...</span>
          </div>
        </div>
      </div>
    )
  }

  // Login/signup form
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">🌱 GOOD CARE</CardTitle>
            <CardDescription>Your wellness journey starts here</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Password</label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loginLoading}>
                    {loginLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Password</label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loginLoading}>
                    {loginLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              </TabsContent>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">or</span>
                </div>
              </div>

              <Button variant="outline" className="w-full" onClick={handleDemoLogin} disabled={loginLoading}>
                🚀 Try Demo Mode
              </Button>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    )
  }

  // User dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">🌱 GOOD CARE</h1>
            <p className="text-gray-600">Welcome, {user.username || user.email?.split("@")[0] || "Friend"}! 👋</p>
            {user.wallet_address && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Wallet:</span>
                <code className="bg-gray-100 px-2 py-1 rounded">{user.wallet_address}</code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => {
                    navigator.clipboard.writeText(user.wallet_address)
                    toast({
                      title: "Copied!",
                      description: "Wallet address copied to clipboard",
                    })
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                  </svg>
                </Button>
              </div>
            )}
          </div>
          <Button variant="outline" onClick={handleSignOut} className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-sm text-muted-foreground">CARE Points</p>
                  <p className="text-2xl font-bold">{user.care_points || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Level</p>
                  <p className="text-2xl font-bold">{Math.floor((user.care_points || 0) / 100) + 1}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Community</p>
                  <p className="text-2xl font-bold">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Rank</p>
                  <p className="text-2xl font-bold">#--</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="checkin" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="checkin" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Check-in
            </TabsTrigger>
            <TabsTrigger value="wallet" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Wallet
            </TabsTrigger>
            <TabsTrigger value="send" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Send
            </TabsTrigger>
            <TabsTrigger value="community" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Community
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="checkin">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  Daily Check-in
                </CardTitle>
                <CardDescription>How are you feeling today? Track your mood and earn CARE Points.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium">How are you feeling today?</label>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { value: 1, label: "Struggling", emoji: "😔" },
                      { value: 2, label: "Low", emoji: "😕" },
                      { value: 3, label: "Okay", emoji: "😐" },
                      { value: 4, label: "Good", emoji: "😊" },
                      { value: 5, label: "Great", emoji: "😄" },
                    ].map((mood) => (
                      <button
                        key={mood.value}
                        onClick={() => setSelectedMood(mood.value)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          selectedMood === mood.value
                            ? "border-primary bg-primary/10"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="text-2xl mb-1">{mood.emoji}</div>
                        <div className="text-xs font-medium">{mood.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">What are you grateful for today? (Optional)</label>
                  <Textarea
                    placeholder="I'm grateful for..."
                    value={gratitudeNote}
                    onChange={(e) => setGratitudeNote(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>

                <Button onClick={handleCheckIn} disabled={!selectedMood || checkInLoading} className="w-full">
                  {checkInLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Recording check-in...
                    </>
                  ) : (
                    "Complete Check-in"
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wallet">
            <Card>
              <CardHeader>
                <CardTitle>Your Wallet</CardTitle>
                <CardDescription>View your tokens and NFTs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">CARE Token</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3">
                        <div className="bg-green-100 p-3 rounded-full">
                          <Heart className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{(Math.random() * 100).toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">≈ $0.00</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">GCT Token</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-3 rounded-full">
                          <TrendingUp className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{(Math.random() * 1000).toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">≈ $0.00</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="pt-4">
                  <h3 className="text-lg font-medium mb-3">Your NFTs</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="border rounded-lg overflow-hidden">
                        <div className="aspect-square bg-gray-100 flex items-center justify-center">
                          <span className="text-4xl">🌱</span>
                        </div>
                        <div className="p-3">
                          <p className="font-medium">Reflection #{i + 1}</p>
                          <p className="text-sm text-muted-foreground">Daily Check-in</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="send">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Send Tokens
                </CardTitle>
                <CardDescription>Send CARE tokens to other users</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Recipient Address</label>
                  <Input placeholder="0x..." value={sendAddress} onChange={(e) => setSendAddress(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={sendAmount}
                    onChange={(e) => setSendAmount(e.target.value)}
                  />
                </div>
                <Button onClick={handleSendTokens} disabled={!sendAmount || !sendAddress} className="w-full">
                  Send Tokens
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="community">
            <Card>
              <CardHeader>
                <CardTitle>Community Leaderboard</CardTitle>
                <CardDescription>See who's leading in CARE Points</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between p-3 rounded-lg ${i === 0 ? "bg-yellow-50 border border-yellow-100" : "bg-gray-50"}`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            i === 0
                              ? "bg-yellow-200 text-yellow-800"
                              : i === 1
                                ? "bg-gray-200 text-gray-800"
                                : i === 2
                                  ? "bg-orange-200 text-orange-800"
                                  : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {i + 1}
                        </div>
                        <div>
                          <p className="font-medium">User {i + 1}</p>
                          <p className="text-xs text-muted-foreground">Level {Math.floor(Math.random() * 10) + 1}</p>
                        </div>
                      </div>
                      <div className="font-bold">{Math.floor(Math.random() * 1000) + 500} pts</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Your Profile</CardTitle>
                <CardDescription>Manage your GOOD CARE profile and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Username</label>
                    <p className="text-lg">{user.username || user.email?.split("@")[0]}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <p className="text-lg">{user.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Wallet Address</label>
                    {user.wallet_address ? (
                      <div className="flex items-center gap-2 mt-1">
                        <code className="bg-gray-100 px-2 py-1 rounded text-xs sm:text-sm break-all">
                          {user.wallet_address}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 flex-shrink-0"
                          onClick={() => {
                            navigator.clipboard.writeText(user.wallet_address)
                            toast({
                              title: "Copied!",
                              description: "Wallet address copied to clipboard",
                            })
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                          </svg>
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm">Not connected</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium">Member Since</label>
                    <p className="text-lg">{new Date(user.created_at || "").toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Total Points</label>
                    <p className="text-lg">{user.care_points || 0}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Account Type</label>
                    <p className="text-lg capitalize">{user.email?.includes("demo") ? "Demo" : "Standard"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
