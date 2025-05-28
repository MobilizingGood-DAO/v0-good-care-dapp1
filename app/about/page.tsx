import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CHAIN_CONFIG } from "@/lib/blockchain-config"

export default function AboutPage() {
  return (
    <div className="container py-12 space-y-12">
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">About CARE Card</h1>
        <p className="max-w-[700px] mx-auto text-gray-500 md:text-xl">
          Your gateway to a kinder, regenerative crypto experience
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Our Mission</CardTitle>
            <CardDescription>Building a regenerative future</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              CARE Card is built on the belief that blockchain technology can be a powerful force for positive change.
              Our mission is to create a kinder, more regenerative crypto ecosystem that supports community care and
              healing.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>GOOD CARE Network</CardTitle>
            <CardDescription>Chain ID: {CHAIN_CONFIG.chainId}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              The GOOD CARE Network is a custom Avalanche Subnet designed specifically for regenerative economics. It
              provides a fast, low-cost, and environmentally friendly platform for the GOOD ecosystem.
            </p>
            <div className="mt-4 text-sm">
              <div className="font-medium">Network Details:</div>
              <ul className="list-disc list-inside space-y-1 mt-2 text-muted-foreground">
                <li>Chain ID: {CHAIN_CONFIG.chainId}</li>
                <li>
                  Currency: {CHAIN_CONFIG.nativeCurrency.name} ({CHAIN_CONFIG.nativeCurrency.symbol})
                </li>
                <li>RPC URL: {CHAIN_CONFIG.rpcUrls[0]}</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AvaCloud WaaS</CardTitle>
            <CardDescription>Seamless wallet integration</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              We use AvaCloud's Wallets-as-a-Service to provide a seamless onboarding experience. With one-click login
              via email or socials, users receive an embedded wallet that acts as their CARE Card.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4 text-center">
        <h2 className="text-3xl font-bold tracking-tighter">Join Our Community</h2>
        <p className="max-w-[600px] mx-auto text-gray-500">
          Be part of a growing community dedicated to building a more regenerative future
        </p>
        <div className="flex flex-col gap-2 sm:flex-row justify-center pt-4">
          <Link href="/register">
            <Button size="lg" className="bg-green-600 hover:bg-green-700">
              Get Your CARE Card
            </Button>
          </Link>
          <Link href="https://x.com/GoodonAvax" target="_blank" rel="noopener noreferrer">
            <Button size="lg" variant="outline">
              Follow us on X
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
