import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow accessing the dev server from phones/other devices on the LAN.
  allowedDevOrigins: ["192.168.1.34"],
};

export default nextConfig;
