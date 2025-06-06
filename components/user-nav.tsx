"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { AuthService } from "@/lib/auth-service"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export function UserNav() {
  const { toast } = useToast()
  const router = useRouter()
  const [user, setUser] = useState<{ username: string; email?: string; avatar?: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      const result = await AuthService.getCurrentUser()
      if (result.success && result.user) {
        setUser({
          username: result.user.username,
          email: result.user.email,
          avatar: result.user.avatar,
        })
      }
      setIsLoading(false)
    }

    loadUser()
  }, [])

  const handleSignOut = async () => {
    const result = await AuthService.signOut()
    if (result.success) {
      toast({
        title: "Signed out",
        description: "You have been signed out successfully",
      })
      router.push("/login")
    } else {
      toast({
        title: "Sign out failed",
        description: result.error || "Failed to sign out",
        variant: "destructive",
      })
    }
  }

  if (isLoading || !user) {
    return (
      <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full">
        ...
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.username} />
            <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.username}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>Profile</DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>Settings</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
