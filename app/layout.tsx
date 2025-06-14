import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { WalletProvider } from "@/providers/wallet-provider"
import { ClientThemeProvider } from "@/components/client-theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "GOOD CARE Network",
  description: "A mental wealth-focused DApp on the GOOD CARE subnet",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ClientThemeProvider>
          <WalletProvider>{children}</WalletProvider>
        </ClientThemeProvider>
      </body>
    </html>
  )
}
