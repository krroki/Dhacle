import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://golbwnsytwbyoneucunx.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvbGJ3bnN5dHdieW9uZXVjdW54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NzI1MTYsImV4cCI6MjA3MDE0ODUxNn0.8EaDU4a1-FuCeWuRtK0fzxrRDuMvNwoB0a0qALDm6iM',
  },
};

export default nextConfig;
