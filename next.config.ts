import type { NextConfig } from "next";

const nextConfig: any = {
  // If you are accessing the dev server from a different IP or domain, add it here.
  // In production, this configuration is not required.
  allowedDevOrigins: ['192.168.0.120', 'localhost:3000', process.env.NEXT_PUBLIC_APP_URL].filter(Boolean),
};

export default nextConfig;
