// Health check API to test Supabase connection
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';

export async function GET(request: NextRequest) {
  console.log('Health check API called');
  
  try {
    // Test 1: Environment variables
    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    console.log('Environment check:', { hasUrl, hasKey });
    
    // Test 2: Create Supabase client
    let clientCreated = false;
    let supabaseError = null;
    
    try {
      const supabase = await createSupabaseRouteHandlerClient();
      clientCreated = true;
      console.log('Supabase client created successfully');
      
      // Test 3: Simple query to check database connection
      const { data: tableCheck, error: tableError } = await supabase
        .from('revenue_proofs')
        .select('id')
        .limit(1);
      
      console.log('Table query result:', { 
        hasData: !!tableCheck, 
        error: tableError?.message 
      });
      
      // Test 4: Check auth session
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      console.log('Auth check:', { 
        hasSession: !!session, 
        error: authError?.message 
      });
      
      return NextResponse.json({
        status: 'healthy',
        environment: {
          hasUrl,
          hasKey,
          nodeEnv: process.env.NODE_ENV
        },
        supabase: {
          clientCreated,
          tableAccess: !tableError,
          tableError: tableError?.message || null,
          authWorking: !authError,
          authError: authError?.message || null,
          hasSession: !!session
        },
        timestamp: new Date().toISOString()
      });
      
    } catch (error: unknown) {
      supabaseError = error instanceof Error ? error.message : 'Unknown error';
      console.error('Supabase client error:', error);
    }
    
    return NextResponse.json({
      status: 'unhealthy',
      environment: {
        hasUrl,
        hasKey,
        nodeEnv: process.env.NODE_ENV
      },
      supabase: {
        clientCreated,
        error: supabaseError
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
    
  } catch (error: unknown) {
    console.error('Health check error:', error);
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}