import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Remove output: 'export' for local development
  // This will be set only for production builds
  
  env: {
    // Remove NODE_ENV from env as it's not allowed
    API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:5086'
  },
  
  // Only apply rewrites in production
  async rewrites() {
    if (process.env.NODE_ENV === 'production') {
      return [
        {
          source: '/api/:path*',
          destination: `${process.env.API_BASE_URL}/api/:path*`
        }
      ]
    }
    return []
  },
  
  // Only apply headers in production
  async headers() {
    if (process.env.NODE_ENV === 'production') {
      return [
        {
          source: '/(.*)',
          headers: [
            {
              key: 'X-Frame-Options',
              value: 'DENY'
            },
            {
              key: 'X-Content-Type-Options',
              value: 'nosniff'
            },
            {
              key: 'Referrer-Policy',
              value: 'strict-origin-when-cross-origin'
            }
          ]
        }
      ]
    }
    return []
  }
}

export default nextConfig
