/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer, webpack }) => {
    // Configure fallbacks for browser-only APIs
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
    }
    
    // Add global polyfills for server-side rendering
    if (isServer) {
      config.plugins.push(
        new webpack.DefinePlugin({
          'typeof window': JSON.stringify('undefined'),
        })
      )
    }
    
    return config
  },
  // Disable static optimization for pages using browser APIs
  experimental: {
    serverComponentsExternalPackages: ['@walletconnect/ethereum-provider']
  }
}

export default nextConfig
