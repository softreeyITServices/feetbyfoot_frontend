import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dummyimage.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.site.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "feetbyfoot.hiremyrecruiter.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "laviors.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.laviors.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
