import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

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
    <div className="recent-sales space-y-8">
      {recentSalesData.map((sale, index) => (
        <div key={index} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src={sale.avatar || "/placeholder.svg"} alt="Avatar" />
            <AvatarFallback>
              {sale.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{sale.name}</p>
            <p className="text-sm text-muted-foreground">{sale.email}</p>
          </div>
          <div className="ml-auto font-medium text-green-600">{sale.amount}</div>
        </div>
      ))}
    </div>
  )
}
