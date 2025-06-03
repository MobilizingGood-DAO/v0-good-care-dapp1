import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { RealAuthProvider } from "@/providers/real-auth-provider"
import { WalletProvider } from "@/providers/wallet-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "GOOD CARE - Wellness DApp",
  description: "A regenerative wellness platform on the GOOD CARE Network",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <WalletProvider>
            <RealAuthProvider>
              {children}
              <Toaster />
            </RealAuthProvider>
          </WalletProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
