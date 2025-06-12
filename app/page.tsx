import NextSteps from "@/components/NextSteps"

export default function Home() {
  return (
    <div className="container mx-auto">
      <section className="py-12 px-4 md:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">Welcome to the GOOD CARE Network</h1>
          <p className="text-xl text-gray-600 mb-8">
            Your journey to mental wealth starts here. Connect, heal, and grow with our community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/check-in"
              className="inline-flex items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 transition-colors"
            >
              Daily Check-In
            </a>
            <a
              href="/profile"
              className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-6 py-3 hover:bg-gray-50 transition-colors"
            >
              My CARE Experience
            </a>
          </div>
        </div>
      </section>

      <NextSteps />

      <section className="py-12 px-4 md:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-2">Why GOOD CARE?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We're building a kinder, regenerative crypto experience focused on mental wealth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <span className="text-2xl">💙</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Community Care</h3>
              <p className="text-gray-600">
                Join a supportive network of individuals committed to mental wellness and mutual support.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <span className="text-2xl">🌱</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Personal Growth</h3>
              <p className="text-gray-600">
                Track your wellness journey, earn rewards, and build healthy habits through daily check-ins.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                <span className="text-2xl">🔄</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Regenerative Economy</h3>
              <p className="text-gray-600">
                Participate in a new kind of digital economy where care and contribution are valued and rewarded.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
