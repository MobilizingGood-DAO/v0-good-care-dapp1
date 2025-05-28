"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Home, Wallet, Gift, Send } from 'lucide-react'

export function DashboardNav() {
  const pathname = usePathname()

  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Home,
    },
    {
      title: "Wallet",
      href: "/dashboard/wallet",
      icon: Wallet,
    },
    {
      title: "NFTs",
      href: "/dashboard/nfts",
      icon: Gift,
    },
    {
      title: "Send",
      href: "/dashboard/send",
      icon: Send,
    },
  ]

  return (
    <nav className="grid items-start gap-2 py-4">
      {navItems.map((item) => (
        <Link key={item.href} href={item.href}>
          <Button
            variant={pathname === item.href ? "default" : "ghost"}
            className={cn("w-full justify-start", pathname === item.href ? "bg-green-600 hover:bg-green-700" : "")}
          >
            <item.icon className="mr-2 h-4 w-4" />
            {item.title}
          </Button>
        </Link>
      ))}
    </nav>
  )
}
