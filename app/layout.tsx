import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { RealAuthProvider } from "@/providers/real-auth-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { WalletProvider } from "@/providers/wallet-provider"

export const metadata: Metadata = {
  title: "v0 App",
  description: "Created with v0",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <RealAuthProvider>
          <WalletProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
              <div className="min-h-screen bg-background font-sans antialiased">
                <Toaster />
                {children}
              </div>
            </ThemeProvider>
          </WalletProvider>
        </RealAuthProvider>
      </body>
    </html>
  )
}
