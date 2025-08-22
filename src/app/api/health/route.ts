// Health check API to test Supabase connection

// Use Node.js runtime for Supabase compatibility
export const runtime = 'nodejs';

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
export async function GET(): Promise<NextResponse> {
  console.log('Health check API called');

  try {
    // Test 1: Environment variables
    const has_url = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    const has_key = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    console.log('Environment check:', { hasUrl: has_url, hasKey: has_key });

    // Test 2: Create Supabase client
    let client_created = false;
    let supabase_error = null;

    try {
      const supabase = await createRouteHandlerClient({ cookies });
      client_created = true;
      console.log('Supabase client created successfully');

      // Test 3: Simple query to check database connection
      const { data: table_check, error: table_error } = await supabase
        .from('revenue_proofs')
        .select('id')
        .limit(1);

      console.log('Table query result:', {
        hasData: !!table_check,
        error: table_error?.message,
      });

      // Test 4: Check auth session
      const {
        data: { user },
        error: auth_error,
      } = await supabase.auth.getUser();

      console.log('Auth check:', {
        hasSession: !!user,
        error: auth_error?.message,
      });

      return NextResponse.json({
        status: 'healthy',
        environment: {
          hasUrl: has_url,
          hasKey: has_key,
          nodeEnv: process.env.NODE_ENV,
        },
        supabase: {
          clientCreated: client_created,
          tableAccess: !table_error,
          tableError: table_error?.message || null,
          authWorking: !auth_error,
          authError: auth_error?.message || null,
          hasSession: !!user,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: unknown) {
      supabase_error = error instanceof Error ? error.message : 'Unknown error';
    }

    return NextResponse.json(
      {
        status: 'unhealthy',
        environment: {
          hasUrl: has_url,
          hasKey: has_key,
          nodeEnv: process.env.NODE_ENV,
        },
        supabase: {
          clientCreated: client_created,
          error: supabase_error,
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
