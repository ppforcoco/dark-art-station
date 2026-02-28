import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow all standard image formats from the R2 CDN
    formats: ["image/webp", "image/avif"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.hauntedwallpapers.com",
        port: "",
        pathname: "/thumbnails/**",
      },
      {
        protocol: "https",
        hostname: "assets.hauntedwallpapers.com",
        port: "",
        pathname: "/high-res/**",
      },
    ],
  },
};

export default nextConfig;