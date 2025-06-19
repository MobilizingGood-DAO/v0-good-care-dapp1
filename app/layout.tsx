import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ClientThemeProvider } from "@/components/client-theme-provider"
import { ClientWalletProvider } from "@/providers/client-wallet-provider"
import { Toaster } from "@/components/ui/toast"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "GOOD CARE Network",
  description: "A regenerative crypto experience built on care and community",
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
        <ClientThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ClientWalletProvider>
            {children}
            <Toaster />
          </ClientWalletProvider>
        </ClientThemeProvider>
      </body>
    </html>
  )
}
