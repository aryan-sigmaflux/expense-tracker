import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

const nextConfig: NextConfig = {
  // Allow accessing the dev server from phones/other devices on the LAN.
  allowedDevOrigins: ["192.168.0.103"],

  // Proxy all Supabase traffic through our own origin. The browser talks to
  // `/sb/*` (same domain Vercel already serves) and we forward server-side to
  // `*.supabase.co`. This way clients never have to resolve the Supabase domain
  // themselves — some ISP/router DNS resolvers fail to, which made the app load
  // but every RPC fail on those networks.
  async rewrites() {
    if (!supabaseUrl) return [];
    return [
      {
        source: "/sb/:path*",
        destination: `${supabaseUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
