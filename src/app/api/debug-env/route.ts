import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Only show in development or with a secret key for security
  const debugKey = process.env.DEBUG_KEY || 'dhacle-debug-2025'
  const requestKey = request.nextUrl.searchParams.get('key')
  
  if (process.env.NODE_ENV === 'production' && requestKey !== debugKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({
    env: process.env.NODE_ENV,
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    supabaseUrlPrefix: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30),
    timestamp: new Date().toISOString(),
    deploymentId: process.env.VERCEL_DEPLOYMENT_ID || 'local',
  })
}