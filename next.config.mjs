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
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Mock browser-only APIs for server-side rendering
      config.resolve.alias = {
        ...config.resolve.alias,
      }
    }
    
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    }
    
    // Add global polyfills for server-side
    if (isServer) {
      config.plugins.push(
        new config.webpack.DefinePlugin({
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
