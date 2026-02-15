import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "awighjfumkctzcgenwoz.supabase.co"
      },
    ],
  },
}

export default nextConfig
