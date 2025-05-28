import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ServerHeroSection } from "@/components/server-hero-section"
import { Features } from "@/components/features"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          <div className="flex gap-6 md:gap-10">
            <Link href="/" className="flex items-center space-x-2">
              <img
                src="/images/care-token-logo.png"
                alt="CARE Card Logo"
                className="h-8 w-8 mr-2"
              />
              <span className="inline-block font-bold text-xl">CARE Card</span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-4">
              <Link href="https://x.com/GoodonAvax" target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:underline">
                Follow us on X
              </Link>
              <Link href="/register">
                <Button>Get Started</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <ServerHeroSection />
        <Features />
      </main>
      <Footer />
    </div>
  )
}
