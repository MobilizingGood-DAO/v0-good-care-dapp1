import Link from "next/link"
import {
  ArrowRight,
  Twitter,
  Wallet,
  Headphones,
  Gift,
  Calendar,
  BarChart3,
  Users,
  PenToolIcon as Tool,
  Server,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function NextSteps() {
  const steps = [
    {
      title: "Beginner",
      description: "Start your GOOD CARE journey with these simple steps",
      items: [
        {
          icon: <Twitter className="h-5 w-5" />,
          title: "Follow us on Twitter",
          description: "Stay updated with the latest news and announcements",
          link: "https://twitter.com/goodonavax",
          linkText: "Follow @goodonavax",
        },
        {
          icon: <Wallet className="h-5 w-5" />,
          title: "Set up your wallet",
          description: "Create and secure your digital wallet for GOOD tokens",
          link: "https://support.metamask.io",
          linkText: "MetaMask Guide",
        },
        {
          icon: <Headphones className="h-5 w-5" />,
          title: "Join a listening circle",
          description: "Connect with others in a supportive environment",
          link: "https://www.goodonavax.info",
          linkText: "Learn More",
        },
      ],
      color: "bg-blue-50 border-blue-200",
      buttonColor: "bg-blue-500 hover:bg-blue-600",
    },
    {
      title: "Intermediate",
      description: "Deepen your engagement with these next steps",
      items: [
        {
          icon: <BarChart3 className="h-5 w-5" />,
          title: "Trade GOOD tokens",
          description: "Start trading on our decentralized exchange",
          link: "https://apex.exchange",
          linkText: "Visit DEX",
        },
        {
          icon: <Gift className="h-5 w-5" />,
          title: "Collect CARE NFTs",
          description: "Explore our collection of wellness-focused NFTs",
          link: "https://salvor.io",
          linkText: "NFT Gallery",
        },
        {
          icon: <Calendar className="h-5 w-5" />,
          title: "Daily check-ins",
          description: "Build a streak and earn multipliers on CARE points",
          link: "/check-in",
          linkText: "Check In Now",
        },
      ],
      color: "bg-green-50 border-green-200",
      buttonColor: "bg-green-500 hover:bg-green-600",
    },
    {
      title: "Advanced",
      description: "Become a core contributor to the GOOD CARE ecosystem",
      items: [
        {
          icon: <Users className="h-5 w-5" />,
          title: "Co-create with us",
          description: "Schedule a call to discuss collaboration opportunities",
          link: "https://calendly.com/goodcareavax/30min",
          linkText: "Book a Call",
        },
        {
          icon: <Tool className="h-5 w-5" />,
          title: "Build tools & dApps",
          description: "Contribute to our open-source ecosystem",
          link: "https://www.goodonavax.info",
          linkText: "Developer Docs",
        },
        {
          icon: <Server className="h-5 w-5" />,
          title: "Run a validator node",
          description: "Help secure the GOOD CARE subnet",
          link: "https://www.goodonavax.info",
          linkText: "Validator Guide",
        },
      ],
      color: "bg-purple-50 border-purple-200",
      buttonColor: "bg-purple-500 hover:bg-purple-600",
    },
  ]

  return (
    <section className="py-12 px-4 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight mb-2">Next Steps with GOOD CARE</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your journey to mental wealth starts here. Choose your path based on your experience level.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <Card key={index} className={`border ${step.color} transition-all hover:shadow-md`}>
              <CardHeader>
                <CardTitle className="text-xl font-bold">{step.title}</CardTitle>
                <CardDescription>{step.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {step.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-start gap-3">
                    <div className="mt-0.5 bg-white p-1.5 rounded-full border shadow-sm">{item.icon}</div>
                    <div>
                      <h3 className="font-medium">{item.title}</h3>
                      <p className="text-sm text-gray-500">{item.description}</p>
                      <Link
                        href={item.link}
                        className="text-sm font-medium flex items-center gap-1 mt-1 hover:underline"
                        target={item.link.startsWith("http") ? "_blank" : "_self"}
                        rel={item.link.startsWith("http") ? "noopener noreferrer" : ""}
                      >
                        {item.linkText} <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Button className={`w-full ${step.buttonColor} text-white`}>Start {step.title} Journey</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
