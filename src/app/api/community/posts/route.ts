import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * GET /api/community/posts
 * 게시글 목록 조회
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const searchParams = req.nextUrl.searchParams;
    const category = searchParams.get('category') || 'board';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 20;
    const offset = (page - 1) * limit;

    // 게시글 목록 조회 (사용자 정보 포함)
    const { data, error, count } = await supabase
      .from('community_posts')
      .select(`
        *,
        users:user_id (
          id,
          username,
          avatar_url
        ),
        community_comments(count),
        community_likes(count)
      `, { count: 'exact' })
      .eq('category', category)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching posts:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // 데이터 가공
    const posts = data?.map(post => ({
      ...post,
      comment_count: post.community_comments?.[0]?.count || 0,
      like_count: post.community_likes?.[0]?.count || 0,
      author: post.users
    })) || [];

    return NextResponse.json({
      success: true,
      posts,
      totalCount: count || 0,
      currentPage: page,
      totalPages: Math.ceil((count || 0) / limit)
    });
  } catch (error) {
    console.error('Error in GET /api/community/posts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/community/posts
 * 게시글 작성
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 });
    }

    // 요청 본문 파싱
    const body = await req.json();
    const { category, title, content } = body;

    // 유효성 검사
    if (!category || !title || !content) {
      return NextResponse.json(
        { error: '모든 필드를 입력해주세요' },
        { status: 400 }
      );
    }

    if (!['board', 'qna', 'study'].includes(category)) {
      return NextResponse.json(
        { error: '유효하지 않은 카테고리입니다' },
        { status: 400 }
      );
    }

    if (title.length < 2 || title.length > 100) {
      return NextResponse.json(
        { error: '제목은 2자 이상 100자 이하로 입력해주세요' },
        { status: 400 }
      );
    }

    if (content.length < 10 || content.length > 10000) {
      return NextResponse.json(
        { error: '내용은 10자 이상 10000자 이하로 입력해주세요' },
        { status: 400 }
      );
    }

    // 게시글 저장
    const { data, error } = await supabase
      .from('community_posts')
      .insert({
        user_id: user.id,
        category,
        title,
        content
      })
      .select(`
        *,
        profiles:user_id (
          id,
          username,
          avatar_url
        )
      `)
      .single();

    if (error) {
      console.error('Error creating post:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      post: {
        ...data,
        author: data.profiles,
        comment_count: 0,
        like_count: 0
      }
    });
  } catch (error) {
    console.error('Error in POST /api/community/posts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}