/**
 * API Route: /api/youtube/folders
 * Purpose: Manage YouTube channel folders (sourceFolders)
 * Created: 2025-01-30
 */

// Use Node.js runtime for Supabase compatibility
export const runtime = 'nodejs';

import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
import { type NextRequest, NextResponse } from 'next/server';
import { snakeToCamelCase } from '@/types';
// import { z } from 'zod';

/**
 * GET /api/youtube/folders
 * Fetch user's YouTube channel folders
 */
export async function GET(): Promise<NextResponse> {
  try {
    // Authentication check - using getUser() for consistency
    const supabase = await createSupabaseRouteHandlerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // Fetch folders with channel count
    const { data: folders, error } = await supabase
      .from('source_folders')
      .select(`
        *,
        folder_channels (
          id,
          channel_id
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch folders' }, { status: 500 });
    }

    // Calculate channel count and convert to camelCase
    const folders_with_count = (folders || []).map((folder: any) => {
      const folderData = snakeToCamelCase(folder);
      return {
        ...folderData,
        channelCount: folder.folder_channels?.length || folder.channel_count || 0,
        folderChannels: folder.folder_channels?.map((fc: any) => snakeToCamelCase(fc)) || [],
      };
    });

    return NextResponse.json({
      success: true,
      folders: folders_with_count,
    });
  } catch (_error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/youtube/folders
 * Create a new folder
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Authentication check
    const supabase = await createSupabaseRouteHandlerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { name, description, color, icon } = body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ error: 'Folder name is required' }, { status: 400 });
    }

    // Check for duplicate folder name
    const { data: existing_folder } = await supabase
      .from('source_folders')
      .select('id')
      .eq('user_id', user.id)
      .eq('name', name.trim())
      .single();

    if (existing_folder) {
      return NextResponse.json(
        { error: 'A folder with this name already exists' },
        { status: 400 }
      );
    }

    // Create new folder
    const { data: new_folder, error } = await supabase
      .from('source_folders')
      .insert({
        user_id: user.id,
        name: name.trim(),
        description: description?.trim() || null,
        color: color || '#3B82F6', // Default blue color
        icon: icon || '📁',
        is_active: true,
        channel_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to create folder' }, { status: 500 });
    }

    return NextResponse.json(
      {
        success: true,
        folder: snakeToCamelCase(new_folder),
      },
      { status: 201 }
    );
  } catch (_error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT /api/youtube/folders
 * Update an existing folder
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    // Authentication check
    const supabase = await createSupabaseRouteHandlerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { id, name, description, color, icon } = body;

    // Validate folder ID
    if (!id) {
      return NextResponse.json({ error: 'Folder ID is required' }, { status: 400 });
    }

    // Check if folder exists and belongs to user
    const { data: existing_folder } = await supabase
      .from('source_folders')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!existing_folder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    // Prepare update data
    const update_data: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined && name.trim() !== '') {
      // Check for duplicate name if changing
      const { data: duplicate_folder } = await supabase
        .from('source_folders')
        .select('id')
        .eq('user_id', user.id)
        .eq('name', name.trim())
        .neq('id', id)
        .single();

      if (duplicate_folder) {
        return NextResponse.json(
          { error: 'A folder with this name already exists' },
          { status: 400 }
        );
      }
      update_data.name = name.trim();
    }

    if (description !== undefined) {
      update_data.description = description?.trim() || null;
    }

    if (color !== undefined) {
      update_data.color = color;
    }

    if (icon !== undefined) {
      update_data.icon = icon;
    }

    // Update folder
    const { data: updated_folder, error } = await supabase
      .from('source_folders')
      .update(update_data)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to update folder' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      folder: snakeToCamelCase(updated_folder),
    });
  } catch (_error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/youtube/folders
 * Delete a folder and its channel associations
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    // Authentication check
    const supabase = await createSupabaseRouteHandlerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // Parse query parameters
    const search_params = request.nextUrl.searchParams;
    const folder_id = search_params.get('id');

    // Validate folder ID
    if (!folder_id) {
      return NextResponse.json({ error: 'Folder ID is required' }, { status: 400 });
    }

    // Check if folder exists and belongs to user
    const { data: existing_folder } = await supabase
      .from('source_folders')
      .select('id')
      .eq('id', folder_id)
      .eq('user_id', user.id)
      .single();

    if (!existing_folder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    // Delete channel associations first (due to foreign key constraint)
    const { error: channel_error } = await supabase
      .from('folder_channels')
      .delete()
      .eq('folder_id', folder_id);

    if (channel_error) {
      return NextResponse.json({ error: 'Failed to delete folder channels' }, { status: 500 });
    }

    // Delete the folder
    const { error } = await supabase
      .from('source_folders')
      .delete()
      .eq('id', folder_id)
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json({ error: 'Failed to delete folder' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Folder deleted successfully',
    });
  } catch (_error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
