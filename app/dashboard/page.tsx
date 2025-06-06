import { Shell } from "@/components/shell"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Overview } from "@/components/overview"
import { RecentSales } from "@/components/recent-sales"
import { EnhancedCheckIn } from "@/components/enhanced-check-in"

export default function DashboardPage() {
  return (
    <Shell>
      <Tabs defaultValue="overview" className="w-full space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="checkin">Check In</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Overview />
          </div>
          <RecentSales />
        </TabsContent>
        <TabsContent value="checkin" className="space-y-4">
          <EnhancedCheckIn />
        </TabsContent>
        <TabsContent value="reports" className="space-y-4">
          Reports Content
        </TabsContent>
        <TabsContent value="settings" className="space-y-4">
          Settings Content
        </TabsContent>
      </Tabs>
    </Shell>
  )
}
