import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    browserDebugInfoInTerminal: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  output: "standalone",
  serverExternalPackages: ["@supabase/supabase-js"],
  env: {
    SKIP_ENV_VALIDATION: "true",
  },
  webpack: (config, { isServer, nextRuntime }) => {
    if (nextRuntime === "edge" && !isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        process: false,
      };
    }
    return config;
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "k.kakaocdn.net" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "yt3.ggpht.com" },
      { protocol: "https", hostname: "api.dicebear.com" },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    unoptimized: process.env.NODE_ENV === "development",
  },
};

export default nextConfig;
