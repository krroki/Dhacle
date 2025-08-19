// Health check API to test Supabase connection

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
export async function GET(): Promise<NextResponse> {
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
      const supabase = await createRouteHandlerClient({ cookies });
      clientCreated = true;
      console.log('Supabase client created successfully');

      // Test 3: Simple query to check database connection
      const { data: tableCheck, error: tableError } = await supabase
        .from('revenue_proofs')
        .select('id')
        .limit(1);

      console.log('Table query result:', {
        hasData: !!tableCheck,
        error: tableError?.message,
      });

      // Test 4: Check auth session
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      console.log('Auth check:', {
        hasSession: !!user,
        error: authError?.message,
      });

      return NextResponse.json({
        status: 'healthy',
        environment: {
          hasUrl,
          hasKey,
          nodeEnv: process.env.NODE_ENV,
        },
        supabase: {
          clientCreated,
          tableAccess: !tableError,
          tableError: tableError?.message || null,
          authWorking: !authError,
          authError: authError?.message || null,
          hasSession: !!user,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: unknown) {
      supabaseError = error instanceof Error ? error.message : 'Unknown error';
    }

    return NextResponse.json(
      {
        status: 'unhealthy',
        environment: {
          hasUrl,
          hasKey,
          nodeEnv: process.env.NODE_ENV,
        },
        supabase: {
          clientCreated,
          error: supabaseError,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
