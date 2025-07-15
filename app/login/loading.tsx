export default function LoginLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  )
}
