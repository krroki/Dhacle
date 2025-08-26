/**
 * API Route: /api/certificates
 * Purpose: User certificates management
 * Methods: GET, POST
 */

import { requireAuth } from '@/lib/api-auth';
import { logger } from '@/lib/logger';
import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
import { type NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export const runtime = 'nodejs';

/**
 * GET /api/certificates
 * Get user's certificates or a specific certificate
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Authentication check
    const user = await requireAuth(request);
    if (!user) {
      logger.warn('Unauthorized access attempt to certificates API');
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const supabase = await createSupabaseRouteHandlerClient();
    const searchParams = request.nextUrl.searchParams;
    const certificateId = searchParams.get('id');
    const courseId = searchParams.get('courseId');

    // Get specific certificate
    if (certificateId) {
      const { data, error } = await supabase
        .from('user_certificates')
        .select('*')
        .eq('id', certificateId)
        .single();

      if (error) {
        logger.error('Failed to fetch certificate:', error);
        return NextResponse.json(
          { error: 'Certificate not found' },
          { status: 404 }
        );
      }

      // Check if user owns this certificate or it's public
      if (data.user_id !== user.id && !data.is_public) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }

      return NextResponse.json({ data });
    }

    // Get certificate for specific course
    if (courseId) {
      const { data, error } = await supabase
        .from('user_certificates')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
        logger.error('Failed to fetch course certificate:', error);
        return NextResponse.json(
          { error: 'Failed to fetch certificate' },
          { status: 500 }
        );
      }

      return NextResponse.json({ data: data || null });
    }

    // Get all user's certificates
    const { data, error } = await supabase
      .from('user_certificates')
      .select('*')
      .eq('user_id', user.id)
      .order('issued_at', { ascending: false });

    if (error) {
      logger.error('Failed to fetch certificates:', error);
      return NextResponse.json(
        { error: 'Failed to fetch certificates' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: data || [] });
  } catch (error) {
    logger.error('Certificates API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/certificates
 * Create a new certificate (Service role only in production)
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Authentication check
    const user = await requireAuth(request);
    if (!user) {
      logger.warn('Unauthorized access attempt to certificates API');
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { course_id, completion_date, score } = body;

    if (!course_id || !completion_date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseRouteHandlerClient();

    // Check if certificate already exists
    const { data: existing } = await supabase
      .from('user_certificates')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', course_id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Certificate already exists for this course' },
        { status: 409 }
      );
    }

    // Generate unique certificate hash
    const certificateHash = `CERT-${Date.now()}-${uuidv4().slice(0, 8).toUpperCase()}`;

    // Create certificate
    const { data, error } = await supabase
      .from('user_certificates')
      .insert({
        user_id: user.id,
        course_id,
        certificate_number: certificateHash,
        completion_date: completion_date || new Date().toISOString(),
        issued_at: new Date().toISOString(),
        score: score ? Math.min(100, Math.max(0, score)) : 100,
        is_public: false,
        grade: score && score >= 90 ? 'A' : score && score >= 80 ? 'B' : score && score >= 70 ? 'C' : 'Pass',
      })
      .select()
      .single();

    if (error) {
      logger.error('Failed to create certificate:', error);
      return NextResponse.json(
        { error: 'Failed to create certificate' },
        { status: 500 }
      );
    }

    logger.info('Certificate created', { 
      userId: user.id,
      metadata: {
        course_id,
        certificate_hash: certificateHash
      }
    });

    return NextResponse.json(
      { 
        data,
        message: 'Certificate created successfully' 
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error('Certificates API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/certificates
 * Update certificate (make public/private, update URL)
 */
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    // Authentication check
    const user = await requireAuth(request);
    if (!user) {
      logger.warn('Unauthorized access attempt to certificates API');
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, is_public, certificate_url } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Certificate ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseRouteHandlerClient();

    // Verify ownership
    const { data: certificate } = await supabase
      .from('user_certificates')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!certificate || certificate.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Certificate not found or access denied' },
        { status: 403 }
      );
    }

    // Update certificate
    interface CertificateUpdate {
      is_public?: boolean;
      certificate_url?: string;
    }
    const updates: CertificateUpdate = {};
    if (typeof is_public === 'boolean') updates.is_public = is_public;
    if (certificate_url !== undefined) updates.certificate_url = certificate_url;

    const { data, error } = await supabase
      .from('user_certificates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Failed to update certificate:', error);
      return NextResponse.json(
        { error: 'Failed to update certificate' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      data,
      message: 'Certificate updated successfully' 
    });
  } catch (error) {
    logger.error('Certificates API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}