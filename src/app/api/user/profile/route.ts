import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/database.types'

// GET: Get user profile
export async function GET() {
  const cookieStore = await cookies()
  
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch {
            // Server Component
          }
        },
        remove(name: string) {
          try {
            cookieStore.delete(name)
          } catch {
            // Server Component
          }
        },
      },
    }
  )

  try {
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 })
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST: Create or update user profile (for onboarding)
export async function POST(request: Request) {
  const cookieStore = await cookies()
  
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch {
            // Server Component
          }
        },
        remove(name: string) {
          try {
            cookieStore.delete(name)
          } catch {
            // Server Component
          }
        },
      },
    }
  )

  try {
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { 
      username, 
      work_type, 
      job_category, 
      current_income, 
      target_income, 
      experience_level 
    } = body

    // Validate username format
    if (username && !/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json(
        { error: 'Invalid username format' },
        { status: 400 }
      )
    }

    // Check if profile exists (users 테이블 사용)
    const { data: existingProfile } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single()

    let result
    
    if (existingProfile) {
      // Update existing profile
      result = await supabase
        .from('users')
        .update({
          username,
          work_type,
          job_category,
          current_income,
          target_income,
          experience_level,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single()
    } else {
      // Create new profile
      result = await supabase
        .from('users')
        .insert({
          id: user.id,
          username,
          work_type,
          job_category,
          current_income,
          target_income,
          experience_level,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()
    }

    if (result.error) {
      console.error('Error saving profile:', result.error)
      
      // Check for unique constraint violation
      if (result.error.code === '23505' && result.error.message.includes('username')) {
        return NextResponse.json(
          { error: 'Username already taken' },
          { status: 409 }
        )
      }
      
      return NextResponse.json(
        { error: 'Failed to save profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({ profile: result.data })
  } catch (error) {
    console.error('Error saving profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT: Update user profile
export async function PUT(request: Request) {
  const cookieStore = await cookies()
  
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch {
            // Server Component
          }
        },
        remove(name: string) {
          try {
            cookieStore.delete(name)
          } catch {
            // Server Component
          }
        },
      },
    }
  )

  try {
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { 
      username, 
      full_name, 
      channel_name, 
      channel_url,
      work_type,
      job_category,
      current_income,
      target_income,
      experience_level
    } = body

    // Validate username format
    if (username && !/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json(
        { error: 'Invalid username format' },
        { status: 400 }
      )
    }

    // Update user profile
    const { data: updatedProfile, error: updateError } = await supabase
      .from('users')
      .update({
        username,
        full_name,
        channel_name,
        channel_url,
        work_type,
        job_category,
        current_income,
        target_income,
        experience_level,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating profile:', updateError)
      
      // Check for unique constraint violation
      if (updateError.code === '23505' && updateError.message.includes('username')) {
        return NextResponse.json(
          { error: 'Username already taken' },
          { status: 409 }
        )
      }
      
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({ profile: updatedProfile })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}