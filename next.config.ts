import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.pt-aau.com',
        port: '',
        pathname: '/**', // Menambahkan pathname agar mencakup semua subfolder
      },
    ],
  },
};

export default nextConfig;
