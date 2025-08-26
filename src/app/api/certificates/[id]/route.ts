/**
 * API Route: /api/certificates/[id]
 * Purpose: Public certificate viewing
 * Methods: GET
 */

import { logger } from '@/lib/logger';
import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

interface Params {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/certificates/[id]
 * Get public certificate details
 */
export async function GET(
  _request: NextRequest,
  { params }: Params
): Promise<NextResponse> {
  try {
    const { id: certificateId } = await params;

    if (!certificateId) {
      return NextResponse.json(
        { error: 'Certificate ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseRouteHandlerClient();

    // Get certificate with user and course info
    const { data: certificate, error } = await supabase
      .from('user_certificates')
      .select(`
        *,
        user:users!user_id (
          id,
          username,
          nickname,
          profile_image_url
        )
      `)
      .eq('id', certificateId)
      .single();

    if (error) {
      logger.error('Failed to fetch certificate:', error);
      return NextResponse.json(
        { error: 'Certificate not found' },
        { status: 404 }
      );
    }

    // Check if certificate is public
    if (!certificate.is_public) {
      // If not public, require authentication and ownership
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || user.id !== certificate.user_id) {
        return NextResponse.json(
          { error: 'This certificate is private' },
          { status: 403 }
        );
      }
    }

    // Get course information
    const { data: course } = await supabase
      .from('courses')
      .select('id, title, description, instructor_name, thumbnail_url')
      .eq('id', certificate.course_id)
      .single();

    // Return certificate with course info
    return NextResponse.json({
      data: {
        ...certificate,
        course: course || null
      }
    });
  } catch (error) {
    logger.error('Certificate detail API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}