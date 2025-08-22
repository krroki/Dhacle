// Use Node.js runtime for Supabase compatibility
export const runtime = 'nodejs';

import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
import { type NextRequest, NextResponse } from 'next/server';

interface CommentWithProfile {
  id: string;
  content: string;
  created_at: string;
  parent_id: string | null;
  users: {
    id: string;
    username: string;
    avatar_url?: string;
  };
}

/**
 * GET /api/community/posts/[id]
 * 게시글 상세 조회
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const supabase = await createSupabaseRouteHandlerClient();
    const { id: post_id } = await params;

    // 게시글 조회
    const { data: post, error: post_error } = await supabase
      .from('community_posts')
      .select(`
        *,
        users:user_id (
          id,
          username,
          avatar_url
        ),
        community_comments (
          id,
          content,
          created_at,
          parent_id,
          profiles:user_id (
            id,
            username,
            avatar_url
          )
        ),
        community_likes (
          id,
          user_id
        )
      `)
      .eq('id', post_id)
      .single();

    if (post_error) {
      if (post_error.code === 'PGRST116') {
        return NextResponse.json({ error: '게시글을 찾을 수 없습니다' }, { status: 404 });
      }
      throw post_error;
    }

    // 조회수 증가 (별도 RPC 호출)
    await supabase.rpc('incrementViewCount', { post_id: post_id });

    // 데이터 가공
    const formatted_post = {
      ...post,
      author: post.users,
      comments:
        post.community_comments?.map((comment: CommentWithProfile) => ({
          ...comment,
          author: comment.users,
        })) || [],
      like_count: post.community_likes?.length || 0,
      comment_count: post.community_comments?.length || 0,
    };

    return NextResponse.json({
      success: true,
      post: formatted_post,
    });
  } catch (_error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT /api/community/posts/[id]
 * 게시글 수정
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const supabase = await createSupabaseRouteHandlerClient();
    const { id: post_id } = await params;

    // 인증 확인
    const {
      data: { user },
      error: auth_error,
    } = await supabase.auth.getUser();

    if (auth_error || !user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // 요청 본문 파싱
    const body = await req.json();
    const { title, content } = body;

    // 유효성 검사
    if (!title || !content) {
      return NextResponse.json({ error: '제목과 내용을 입력해주세요' }, { status: 400 });
    }

    // 게시글 수정 (RLS 정책이 작성자 확인)
    const { data, error } = await supabase
      .from('community_posts')
      .update({
        title,
        content,
        updated_at: new Date().toISOString(),
      })
      .eq('id', post_id)
      .eq('user_id', user.id) // 작성자 확인
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: '게시글을 수정할 권한이 없습니다' }, { status: 403 });
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      post: data,
    });
  } catch (_error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/community/posts/[id]
 * 게시글 삭제
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const supabase = await createSupabaseRouteHandlerClient();
    const { id: post_id } = await params;

    // 인증 확인
    const {
      data: { user },
      error: auth_error,
    } = await supabase.auth.getUser();

    if (auth_error || !user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // 게시글 삭제 (RLS 정책이 작성자 확인)
    const { error } = await supabase
      .from('community_posts')
      .delete()
      .eq('id', post_id)
      .eq('user_id', user.id); // 작성자 확인

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: '게시글을 삭제할 권한이 없습니다' }, { status: 403 });
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: '게시글이 삭제되었습니다',
    });
  } catch (_error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
