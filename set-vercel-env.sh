#!/bin/bash

# Vercel 환경 변수 설정 스크립트
echo "Setting Vercel environment variables..."

# Supabase URL 설정
echo "https://golbwnsytwbyoneucunx.supabase.co" | vercel env add NEXT_PUBLIC_SUPABASE_URL production

# Supabase Anon Key 설정
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvbGJ3bnN5dHdieW9uZXVjdW54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NzI1MTYsImV4cCI6MjA3MDE0ODUxNn0.8EaDU4a1-FuCeWuRtK0fzxrRDuMvNwoB0a0qALDm6iM" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production

echo "Environment variables set. Now redeploying..."

# 재배포
vercel --prod --force

echo "Deployment complete!"