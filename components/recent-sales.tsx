const recentSalesData = [
  {
    name: "Alex Chen",
    email: "alex@goodcare.com",
    amount: "+25 CARE",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    name: "Sarah Johnson",
    email: "sarah@goodcare.com",
    amount: "+15 CARE",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    name: "Mike Wilson",
    email: "mike@goodcare.com",
    amount: "+30 CARE",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    name: "Emma Davis",
    email: "emma@goodcare.com",
    amount: "+20 CARE",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    name: "James Brown",
    email: "james@goodcare.com",
    amount: "+18 CARE",
    avatar: "/placeholder.svg?height=32&width=32",
  },
]

export const RecentSales = () => {
  return (
    <div className="recent-sales p-4">
      <h3 className="text-lg font-bold mb-2">Recent CARE Token Activity</h3>
      <p>This is placeholder content. Real transaction data will be displayed here.</p>
    </div>
  )
}
