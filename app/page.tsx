import { ClientCheckIn } from "@/components/client-check-in"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <ClientCheckIn />
    </main>
  )
}
