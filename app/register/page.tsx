"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AtSign, Mail, Github, Twitter, Copy, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)

  // Generate a demo wallet address
  const generateWalletAddress = () => {
    const chars = "0123456789abcdef"
    let address = "0x"
    for (let i = 0; i < 40; i++) {
      address += chars[Math.floor(Math.random() * chars.length)]
    }
    return address
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied!",
        description: "Wallet address copied to clipboard",
      })
    } catch (err) {
      console.error("Failed to copy: ", err)
    }
  }

  async function handleEmailSignup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Simulate wallet creation
      const newWalletAddress = generateWalletAddress()
      setWalletAddress(newWalletAddress)

      // Store user data in localStorage for demo
      const userData = {
        email,
        walletAddress: newWalletAddress,
        carePoints: 0,
        joinedAt: new Date().toISOString(),
        isDemo: false,
      }
      localStorage.setItem("goodcare_user", JSON.stringify(userData))

      setSuccess(`Successfully created your CARE Card! Your wallet address: ${newWalletAddress}`)

      // Redirect after a short delay
      setTimeout(() => {
        router.push("/")
      }, 3000)
    } catch (err) {
      setError("An error occurred. Please try again.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSocialLogin(provider: string) {
    setIsLoading(true)
    setError(null)

    try {
      // Simulate social login and wallet creation
      const newWalletAddress = generateWalletAddress()
      setWalletAddress(newWalletAddress)

      // Store user data in localStorage for demo
      const userData = {
        email: `user@${provider.toLowerCase()}.com`,
        walletAddress: newWalletAddress,
        carePoints: 0,
        joinedAt: new Date().toISOString(),
        socialProvider: provider,
        isDemo: false,
      }
      localStorage.setItem("goodcare_user", JSON.stringify(userData))

      setSuccess(`Successfully created your CARE Card with ${provider}! Your wallet: ${newWalletAddress}`)

      // Redirect after a short delay
      setTimeout(() => {
        router.push("/")
      }, 3000)
    } catch (err) {
      setError("An error occurred. Please try again.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  function handleDemoMode() {
    // Create demo user
    const demoWalletAddress = generateWalletAddress()
    const demoUserData = {
      email: "demo@goodcare.com",
      walletAddress: demoWalletAddress,
      carePoints: 150,
      joinedAt: new Date().toISOString(),
      isDemo: true,
    }
    localStorage.setItem("goodcare_user", JSON.stringify(demoUserData))

    toast({
      title: "Demo Mode Activated",
      description: "You can explore all features without signing up",
    })

    router.push("/")
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Create your CARE Card</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email to get started with your regenerative journey
          </p>
        </div>

        <div className="grid gap-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 border-green-600">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
              {walletAddress && (
                <div className="mt-2 p-2 bg-gray-100 rounded flex items-center justify-between">
                  <code className="text-xs break-all">{walletAddress}</code>
                  <Button size="sm" variant="ghost" onClick={() => copyToClipboard(walletAddress)} className="ml-2">
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </Alert>
          )}

          <Alert className="bg-blue-50 border-blue-200">
            <AlertTriangle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Non-Custodial Wallet:</strong> You'll have full control over your private keys. Make sure to
              backup your wallet after creation.
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="social">Social</TabsTrigger>
              <TabsTrigger value="demo">Demo</TabsTrigger>
            </TabsList>

            <TabsContent value="email">
              <form onSubmit={handleEmailSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    placeholder="name@example.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    disabled={isLoading}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    placeholder="Enter your password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
                <Button disabled={isLoading} type="submit" className="w-full bg-green-600 hover:bg-green-700">
                  {isLoading ? "Creating your CARE Card..." : "Create CARE Card"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="social">
              <div className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleSocialLogin("GitHub")}
                  disabled={isLoading}
                >
                  <Github className="mr-2 h-4 w-4" />
                  {isLoading ? "Connecting..." : "Continue with GitHub"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleSocialLogin("Twitter")}
                  disabled={isLoading}
                >
                  <Twitter className="mr-2 h-4 w-4" />
                  {isLoading ? "Connecting..." : "Continue with Twitter"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleSocialLogin("Google")}
                  disabled={isLoading}
                >
                  <AtSign className="mr-2 h-4 w-4" />
                  {isLoading ? "Connecting..." : "Continue with Google"}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="demo">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground text-center py-2">
                  Try GOOD CARE without creating an account. Perfect for exploring all features!
                </p>
                <Button variant="outline" className="w-full" onClick={handleDemoMode} disabled={isLoading}>
                  <Mail className="mr-2 h-4 w-4" />
                  Start Demo Mode
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <p className="px-8 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <button onClick={() => router.push("/")} className="underline underline-offset-4 hover:text-primary">
            Sign in here
          </button>
        </p>

        <p className="px-8 text-center text-sm text-muted-foreground">
          By clicking continue, you agree to our{" "}
          <a href="/terms" className="underline underline-offset-4 hover:text-primary">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy" className="underline underline-offset-4 hover:text-primary">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  )
}
