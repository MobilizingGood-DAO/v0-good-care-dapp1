export function StaticCard() {
  return (
    <div className="relative w-[300px] h-[400px] md:w-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 opacity-90"></div>
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-white">
        <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mb-6">
          <img src="/images/care-token-logo.png" alt="CARE Card Logo" className="w-16 h-16" />
        </div>
        <h3 className="text-2xl font-bold mb-2">CARE Card</h3>
        <div className="w-full border-t border-white/20 my-4"></div>
        <div className="text-center space-y-2">
          <p className="text-sm opacity-80">Holder</p>
          <p className="font-medium">Connect Wallet</p>
        </div>
        <div className="w-full border-t border-white/20 my-4"></div>
        <div className="text-center space-y-2">
          <p className="text-sm opacity-80">GCT Balance</p>
          <p className="font-medium text-xl">0.00</p>
        </div>
        <div className="absolute bottom-4 left-0 right-0 text-center text-xs opacity-70">
          Powered by GOOD CARE Network
        </div>
      </div>
    </div>
  )
}
