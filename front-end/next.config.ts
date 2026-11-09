import type { NextConfig } from "next";

// The backend stores uploaded images and serves them at /uploads. We proxy that
// path so the images are same-origin: next/image can then optimise them without
// the remote-host allowlist or the private-IP (SSRF) guard getting in the way.
//
// This origin is resolved on the server, so it must address the API directly and
// must NOT be derived from NEXT_PUBLIC_API_URL: in production that is the public
// domain, so the rewrite would hand /uploads back to the reverse proxy, which
// hands it back to Next.js, and the request loops until it times out. The default
// is right for local dev and for a single-host deployment alike; override it only
// when the API runs on another machine.
const API_ORIGIN = (process.env.API_INTERNAL_URL ?? "http://127.0.0.1:4000").replace(/\/api\/?$/, "");

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 90],
    // Banner and product images may also be URLs pasted from elsewhere.
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
  async rewrites() {
    return [
      // Lets the browser call the API with a same-origin path. In production the
      // reverse proxy claims /api/ before Next.js ever sees it; in development
      // this rewrite is what makes the same relative path work.
      { source: "/api/:path*", destination: `${API_ORIGIN}/api/:path*` },
      { source: "/uploads/:path*", destination: `${API_ORIGIN}/uploads/:path*` },
    ];
  },
};

export default nextConfig;
