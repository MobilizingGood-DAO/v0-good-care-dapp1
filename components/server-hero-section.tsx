import Link from "next/link"
import { Button } from "@/components/ui/button"
import { StaticCard } from "./static-card"

export function ServerHeroSection() {
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
            <StaticCard />
          </div>
        </div>
      </div>
    </section>
  )
}
