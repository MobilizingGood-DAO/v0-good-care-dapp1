import { Wallet, Gift, Send, Award } from "lucide-react"

export function Features() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-green-100 px-3 py-1 text-sm text-green-600">Features</div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Your Journey with CARE Card</h2>
            <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Experience a kinder, regenerative crypto ecosystem with these powerful features
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <div className="rounded-full bg-green-100 p-3">
              <Wallet className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-bold">Embedded Wallet</h3>
            <p className="text-center text-sm text-gray-500">
              One-click login via email or socials to receive your personal wallet
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <div className="rounded-full bg-green-100 p-3">
              <Gift className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-bold">Receive NFTs</h3>
            <p className="text-center text-sm text-gray-500">Collect reflections, care badges, and event mementos</p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <div className="rounded-full bg-green-100 p-3">
              <Send className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-bold">Send Tokens</h3>
            <p className="text-center text-sm text-gray-500">Share tokens or NFTs as acts of acknowledgment and care</p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <div className="rounded-full bg-green-100 p-3">
              <Award className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-bold">Grow Your Passport</h3>
            <p className="text-center text-sm text-gray-500">Track Soulbound milestones and community action</p>
          </div>
        </div>
      </div>
    </section>
  )
}
