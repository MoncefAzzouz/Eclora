import type { NextConfig } from "next";

// The backend stores uploaded images and serves them at /uploads. We proxy that
// path so the images are same-origin: next/image can then optimise them without
// the remote-host allowlist or the private-IP (SSRF) guard getting in the way.
const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api").replace(/\/api\/?$/, "");

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 90],
    // Banner and product images may also be URLs pasted from elsewhere.
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
  async rewrites() {
    return [{ source: "/uploads/:path*", destination: `${API_ORIGIN}/uploads/:path*` }];
  },
};

export default nextConfig;
