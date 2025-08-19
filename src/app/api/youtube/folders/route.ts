/**
 * API Route: /api/youtube/folders
 * Purpose: Manage YouTube channel folders (source_folders)
 * Created: 2025-01-30
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

/**
 * GET /api/youtube/folders
 * Fetch user's YouTube channel folders
 */
export async function GET() {
  try {
    // Authentication check - using getUser() for consistency
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
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
      console.error('Error fetching folders:', error);
      return NextResponse.json(
        { error: 'Failed to fetch folders' },
        { status: 500 }
      );
    }

    // Calculate channel count for each folder
    const foldersWithCount = (folders || []).map(folder => ({
      ...folder,
      channel_count: folder.folder_channels?.length || 0,
      folder_channels: undefined // Remove raw relation data
    }));

    return NextResponse.json({
      success: true,
      folders: foldersWithCount
    });

  } catch (error) {
    console.error('[/api/youtube/folders] GET Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/youtube/folders
 * Create a new folder
 */
export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { name, description, color, icon } = body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { error: 'Folder name is required' },
        { status: 400 }
      );
    }

    // Check for duplicate folder name
    const { data: existingFolder } = await supabase
      .from('source_folders')
      .select('id')
      .eq('user_id', user.id)
      .eq('folder_name', name.trim())
      .single();

    if (existingFolder) {
      return NextResponse.json(
        { error: 'A folder with this name already exists' },
        { status: 400 }
      );
    }

    // Create new folder
    const { data: newFolder, error } = await supabase
      .from('source_folders')
      .insert({
        user_id: user.id,
        folder_name: name.trim(),
        description: description?.trim() || null,
        color: color || '#3B82F6', // Default blue color
        icon: icon || '📁',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating folder:', error);
      return NextResponse.json(
        { error: 'Failed to create folder' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      folder: newFolder
    }, { status: 201 });

  } catch (error) {
    console.error('[/api/youtube/folders] POST Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/youtube/folders
 * Update an existing folder
 */
export async function PUT(request: NextRequest) {
  try {
    // Authentication check
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { id, name, description, color, icon } = body;

    // Validate folder ID
    if (!id) {
      return NextResponse.json(
        { error: 'Folder ID is required' },
        { status: 400 }
      );
    }

    // Check if folder exists and belongs to user
    const { data: existingFolder } = await supabase
      .from('source_folders')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!existingFolder) {
      return NextResponse.json(
        { error: 'Folder not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    };

    if (name !== undefined && name.trim() !== '') {
      // Check for duplicate name if changing
      const { data: duplicateFolder } = await supabase
        .from('source_folders')
        .select('id')
        .eq('user_id', user.id)
        .eq('folder_name', name.trim())
        .neq('id', id)
        .single();

      if (duplicateFolder) {
        return NextResponse.json(
          { error: 'A folder with this name already exists' },
          { status: 400 }
        );
      }
      updateData.folder_name = name.trim();
    }

    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }

    if (color !== undefined) {
      updateData.color = color;
    }

    if (icon !== undefined) {
      updateData.icon = icon;
    }

    // Update folder
    const { data: updatedFolder, error } = await supabase
      .from('source_folders')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating folder:', error);
      return NextResponse.json(
        { error: 'Failed to update folder' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      folder: updatedFolder
    });

  } catch (error) {
    console.error('[/api/youtube/folders] PUT Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/youtube/folders
 * Delete a folder and its channel associations
 */
export async function DELETE(request: NextRequest) {
  try {
    // Authentication check
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const folderId = searchParams.get('id');

    // Validate folder ID
    if (!folderId) {
      return NextResponse.json(
        { error: 'Folder ID is required' },
        { status: 400 }
      );
    }

    // Check if folder exists and belongs to user
    const { data: existingFolder } = await supabase
      .from('source_folders')
      .select('id')
      .eq('id', folderId)
      .eq('user_id', user.id)
      .single();

    if (!existingFolder) {
      return NextResponse.json(
        { error: 'Folder not found' },
        { status: 404 }
      );
    }

    // Delete channel associations first (due to foreign key constraint)
    const { error: channelError } = await supabase
      .from('folder_channels')
      .delete()
      .eq('folder_id', folderId);

    if (channelError) {
      console.error('Error deleting folder channels:', channelError);
      return NextResponse.json(
        { error: 'Failed to delete folder channels' },
        { status: 500 }
      );
    }

    // Delete the folder
    const { error } = await supabase
      .from('source_folders')
      .delete()
      .eq('id', folderId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting folder:', error);
      return NextResponse.json(
        { error: 'Failed to delete folder' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Folder deleted successfully'
    });

  } catch (error) {
    console.error('[/api/youtube/folders] DELETE Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}