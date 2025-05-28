import Link from "next/link"

export function Footer() {
  return (
    <footer className="w-full border-t bg-background py-6 md:py-8">
      <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex flex-col items-center gap-4 md:flex-row md:gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold">CARE Card</span>
          </Link>
          <nav className="flex gap-4 sm:gap-6">
            <Link href="/about" className="text-sm font-medium hover:underline">
              About
            </Link>
            <Link href="/faq" className="text-sm font-medium hover:underline">
              FAQ
            </Link>
            <Link href="https://x.com/GoodonAvax" target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:underline">
              Follow us on X
            </Link>
          </nav>
        </div>
        <p className="text-center text-sm text-muted-foreground md:text-left">
          &copy; {new Date().getFullYear()} CARE Card. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
