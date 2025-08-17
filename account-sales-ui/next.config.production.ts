import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Production settings for Azure Static Web Apps
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  
  env: {
    API_BASE_URL: process.env.API_BASE_URL || 'https://astral-aone-backend.azurewebsites.net'
  },
  
  // Production rewrites
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.API_BASE_URL}/api/:path*`
      }
    ]
  },
  
  // Production headers
  async headers() {
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
}

export default nextConfig
