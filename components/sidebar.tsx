"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, BarChart2, Wallet, CheckCircle, User } from "lucide-react"

export default function Sidebar() {
  const pathname = usePathname()

  const navItems = [
    { name: "Home", href: "/", icon: <Home className="h-5 w-5" /> },
    { name: "Check-in", href: "/check-in", icon: <CheckCircle className="h-5 w-5" /> },
    { name: "Wallet", href: "/wallet", icon: <Wallet className="h-5 w-5" /> },
    { name: "Leaderboard", href: "/leaderboard", icon: <BarChart2 className="h-5 w-5" /> },
    { name: "My CARE", href: "/profile", icon: <User className="h-5 w-5" /> },
  ]

  return (
    <div className="flex flex-col h-full bg-white border-r">
      <div className="p-4">
        <h2 className="text-xl font-bold">GOOD CARE</h2>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                isActive ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
              {item.name === "Check-in" && (
                <span className="ml-auto bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">+10</span>
              )}
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <User className="h-4 w-4 text-blue-700" />
          </div>
          <div>
            <p className="text-sm font-medium">User123</p>
            <p className="text-xs text-gray-500">1,250 CARE</p>
          </div>
        </div>
      </div>
    </div>
  )
}
