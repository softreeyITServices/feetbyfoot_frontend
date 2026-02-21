import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
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
      },{
        protocol: "https",
        hostname: "picsum.photos",
        pathname: "/**",
      },{
        protocol: "https",
        hostname: "cdn.site.com",
        pathname: "/**",
      },

    ],
  },
};

export default nextConfig;
