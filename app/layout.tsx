import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { WalletProvider } from "@/providers/wallet-provider"
import { ThirdwebWrapper } from "@/providers/thirdweb-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "GOOD Passport",
  description: "Your passport to the GOOD CARE Network - a kinder, regenerative crypto experience",
  keywords: ["blockchain", "crypto", "care", "good", "passport", "avalanche", "subnet"],
  authors: [{ name: "GOOD CARE Network" }],
  openGraph: {
    title: "GOOD Passport",
    description: "Your passport to the GOOD CARE Network - a kinder, regenerative crypto experience",
    type: "website",
  },
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
        <ThirdwebWrapper>
          <WalletProvider>
            {children}
            <Toaster />
          </WalletProvider>
        </ThirdwebWrapper>
      </body>
    </html>
  )
}
