import { Overview } from "@/components/overview"
import { ThirdwebMoodCheckIn } from "@/components/check-in/thirdweb-mood-check-in"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your GOOD Passport dashboard</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="md:col-span-2 lg:col-span-2">
          <ThirdwebMoodCheckIn />
        </div>
        <div className="md:col-span-1 lg:col-span-1">
          <Overview />
        </div>
      </div>
    </div>
  )
}
