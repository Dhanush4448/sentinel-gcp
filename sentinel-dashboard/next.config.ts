import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Google Profile Pictures
      },
    ],
  },
  // Keep your webpack engine enabled if Turbopack is still panicking
  webpack: (config) => {
    return config;
  },
};

export default nextConfig;
