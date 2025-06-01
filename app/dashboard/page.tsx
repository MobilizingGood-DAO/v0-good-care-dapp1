import { EnhancedDailyCheckIn } from "@/components/check-in/enhanced-daily-check-in"
import { CareLeaderboard } from "@/components/care-leaderboard"
import { UserProfileCard } from "@/components/user-profile-card"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Your CARE Journey</h1>
        <p className="text-muted-foreground">
          Welcome to your daily reflection space. Take a moment to check in with yourself.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main check-in area */}
        <div className="lg:col-span-2 space-y-6">
          <EnhancedDailyCheckIn />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <UserProfileCard />
          <CareLeaderboard />
        </div>
      </div>
    </div>
  )
}
