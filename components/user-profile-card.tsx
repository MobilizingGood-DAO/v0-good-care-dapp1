import type React from "react"
import { TwitterIcon } from "lucide-react"

interface UserProfileCardProps {
  user: {
    id: string
    name: string
    email: string
    social_provider?: "twitter" | null
  }
}

export const UserProfileCard: React.FC<UserProfileCardProps> = ({ user }) => {
  return (
    <div className="rounded-md border p-4">
      <h2 className="text-lg font-semibold">{user.name}</h2>
      <p className="text-sm text-muted-foreground">{user.email}</p>

      {user.social_provider === "twitter" && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <TwitterIcon className="h-4 w-4" />
          <span>Connected via Twitter</span>
        </div>
      )}
    </div>
  )
}
