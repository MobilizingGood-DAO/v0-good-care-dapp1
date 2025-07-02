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
  experimental: {
    esmExternals: 'loose'
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    // Handle worker files
    config.module.rules.push({
      test: /\.worker\.js$/,
      loader: 'worker-loader',
      options: { 
        type: 'module',
        publicPath: '/_next/static/workers/'
      },
    });
    
    return config;
  },
};

export default nextConfig;
