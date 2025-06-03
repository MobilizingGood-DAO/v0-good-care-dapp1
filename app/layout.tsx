import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { RealAuthProvider } from "@/providers/real-auth-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "GOOD CARE - Daily Wellness Tracker",
  description: "Track your daily wellness journey and earn CARE Points",
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
        <RealAuthProvider>
          {children}
          <Toaster />
        </RealAuthProvider>
      </body>
    </html>
  )
}
