"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AtSign, Mail, Github, Twitter } from "lucide-react"
import { loginWithEmail, loginWithSocial } from "@/lib/avacloud-waas"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react"
import { useWallet } from "@/providers/wallet-provider"

export function RegisterForm() {
  const router = useRouter()
  const { setAvaCloudWallet } = useWallet()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Create non-custodial embedded wallet using AvaCloud WaaS
      const result = await loginWithEmail(email)

      if (result.success) {
        // Set the wallet in our provider with email info
        setAvaCloudWallet(result.address, result.email)

        setSuccess(
          `Successfully created your non-custodial CARE Card! Wallet: ${result.address.substring(0, 6)}...${result.address.substring(result.address.length - 4)}`,
        )

        // Redirect after a short delay
        setTimeout(() => {
          router.push("/dashboard")
        }, 2000)
      } else {
        setError("Failed to create wallet. Please try again.")
      }
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
      // Login with social using AvaCloud WaaS (non-custodial)
      const result = await loginWithSocial(provider)

      if (result.success) {
        // Set the wallet in our provider with social info
        setAvaCloudWallet(result.address, undefined, result.provider, result.socialId)

        setSuccess(`Successfully created your non-custodial CARE Card with ${provider}!`)

        // Redirect after a short delay
        setTimeout(() => {
          router.push("/dashboard")
        }, 2000)
      } else {
        setError(`Failed to login with ${provider}. Please try again.`)
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
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
        </Alert>
      )}

      <Alert className="bg-blue-50 border-blue-200">
        <AlertTriangle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Non-Custodial Wallet:</strong> You'll have full control over your private keys. Make sure to backup
          your wallet after creation.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="email" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="wallet">Connect</TabsTrigger>
        </TabsList>
        <TabsContent value="email">
          <form onSubmit={onSubmit} className="space-y-4">
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
            <Button disabled={isLoading} type="submit" className="w-full bg-green-600 hover:bg-green-700">
              {isLoading ? "Creating your CARE Card..." : "Create Non-Custodial CARE Card"}
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
        <TabsContent value="wallet">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground text-center py-2">
              Connect your existing MetaMask wallet to access your CARE Card
            </p>
            <Button variant="outline" className="w-full" onClick={() => router.push("/dashboard")} disabled={isLoading}>
              <Mail className="mr-2 h-4 w-4" />
              Connect MetaMask Wallet
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
