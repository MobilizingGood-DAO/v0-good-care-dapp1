"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useWallet } from "@/providers/wallet-provider"

export function HeroSection() {
  const { address, balance } = useWallet()

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-green-50 to-white">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                Your CARE Card to a Regenerative Future
              </h1>
              <p className="max-w-[600px] text-gray-500 md:text-xl">
                One-click login to receive your embedded wallet — a living reflection of your care, contributions, and
                healing journey.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/register">
                <Button size="lg" className="bg-green-600 hover:bg-green-700">
                  Get Your CARE Card
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative w-[300px] h-[400px] md:w-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 opacity-90"></div>
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-white">
                <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mb-6">
                  <img src="/images/care-token-logo.png" alt="CARE Card Logo" className="w-16 h-16" />
                </div>
                <h3 className="text-2xl font-bold mb-2">CARE Card</h3>
                <div className="w-full border-t border-white/20 my-4"></div>
                <div className="text-center space-y-2">
                  <p className="text-sm opacity-80">Holder</p>
                  <p className="font-medium">
                    {address ? address.substring(0, 6) + "..." + address.substring(address.length - 4) : "Connect Wallet"}
                  </p>
                </div>
                <div className="w-full border-t border-white/20 my-4"></div>
                <div className="text-center space-y-2">
                  <p className="text-sm opacity-80">GCT Balance</p>
                  <p className="font-medium text-xl">{balance || "0.00"}</p>
                </div>
                <div className="absolute bottom-4 left-0 right-0 text-center text-xs opacity-70">
                  Powered by GOOD CARE Network
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
