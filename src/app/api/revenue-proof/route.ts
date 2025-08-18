import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
// revenue-proof/route.ts
// 수익인증 메인 API Route (목록 조회, 생성)

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseRouteHandlerClient, createSupabaseServiceRoleClient } from '@/lib/supabase/server-client';
import { createProofSchema } from '@/lib/validations/revenue-proof';
import { z } from 'zod';

// GET: 수익인증 목록 조회
export async function GET(request: NextRequest) {
  
  // 세션 검사
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return new Response(
      JSON.stringify({ error: 'User not authenticated' }),
      { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
  try {
    // Route Handler Client를 사용하여 공개 데이터를 가져옴
    // revenue_proofs 테이블은 공개 읽기 가능하므로 Service Role Key 불필요
    const supabase = await createSupabaseRouteHandlerClient();
    const { searchParams } = new URL(request.url);
    
    // 쿼리 파라미터 파싱
    const platform = searchParams.get('platform') || 'all';
    const filter = searchParams.get('filter') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // 기본 쿼리 구성 (단순화)
    let query = supabase
      .from('revenue_proofs')
      .select('*', { count: 'exact' })
      .eq('is_hidden', false)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // 플랫폼 필터
    if (platform !== 'all') {
      query = query.eq('platform', platform);
    }

    // 기간 필터
    const now = new Date();
    if (filter === 'daily') {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      query = query.gte('created_at', today.toISOString());
    } else if (filter === 'weekly') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      query = query.gte('created_at', weekAgo.toISOString());
    } else if (filter === 'monthly') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      query = query.gte('created_at', monthAgo.toISOString());
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Database query error:', error);
      return NextResponse.json(
        { error: '데이터를 불러오는 중 오류가 발생했습니다' },
        { status: 500 }
      );
    }

    // 사용자 정보를 별도로 조회 (필요한 경우)
    const proofsWithUser = await Promise.all(
      (data || []).map(async (proof) => {
        // 사용자 정보 조회 (선택적)
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .eq('id', proof.user_id)
          .single();

        return {
          ...proof,
          user: profileData || {
            id: proof.user_id,
            username: 'Anonymous',
            avatar_url: null
          },
          // 이미 테이블에 있는 count 필드 사용
          likes_count: proof.likes_count || 0,
          comments_count: proof.comments_count || 0
        };
      })
    );

    return NextResponse.json({
      data: proofsWithUser,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('API error:', error);
    
    // 개발 환경에서는 상세한 에러 메시지 제공
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? `서버 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
      : '서버 오류가 발생했습니다';
    
    return NextResponse.json(
      { 
        error: errorMessage,
        ...(process.env.NODE_ENV === 'development' && {
          details: error instanceof Error ? error.stack : String(error)
        })
      },
      { status: 500 }
    );
  }
}

// POST: 수익인증 생성 (일일 1회 제한)
export async function POST(request: NextRequest) {
  
  // 세션 검사
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return new Response(
      JSON.stringify({ error: 'User not authenticated' }),
      { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
  try {
    const supabase = await createSupabaseRouteHandlerClient();
    
    // 인증 확인
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // FormData 파싱
    const formData = await request.formData();
    
    // FormData를 객체로 변환
    const body = {
      title: formData.get('title') as string,
      amount: parseInt(formData.get('amount') as string),
      platform: formData.get('platform') as string,
      content: formData.get('content') as string,
      signature: formData.get('signature') as string,
      screenshot: formData.get('screenshot') as File
    };

    // 입력값 검증
    const validatedData = createProofSchema.parse(body);

    // 일일 제한 체크 (한국 시간 기준)
    const kstNow = new Date();
    kstNow.setHours(kstNow.getHours() + 9); // UTC to KST
    const todayKST = new Date(kstNow.getFullYear(), kstNow.getMonth(), kstNow.getDate());
    todayKST.setHours(todayKST.getHours() - 9); // KST to UTC
    
    const { count: todayCount } = await supabase
      .from('revenue_proofs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', session.user.id)
      .gte('created_at', todayKST.toISOString());

    if (todayCount && todayCount > 0) {
      return NextResponse.json(
        { 
          error: '오늘은 이미 인증하셨습니다. 내일 다시 시도해주세요!',
          nextAvailable: new Date(todayKST.getTime() + 24 * 60 * 60 * 1000).toISOString()
        },
        { status: 429 }
      );
    }

    // Supabase Storage에 이미지 업로드
    const fileName = `${session.user.id}/${Date.now()}_${validatedData.screenshot.name}`;
    const arrayBuffer = await validatedData.screenshot.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Storage 버킷에 업로드
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('revenue-proofs')
      .upload(fileName, buffer, {
        contentType: validatedData.screenshot.type,
        upsert: false
      });
    
    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      
      // Storage 버킷이 없는 경우 안내
      if (uploadError.message.includes('bucket') || uploadError.message.includes('not found')) {
        return NextResponse.json(
          { 
            error: 'Storage 설정이 필요합니다.',
            instructions: `Supabase Dashboard에서 다음 단계를 진행해주세요:
1. Storage 섹션으로 이동
2. "New Bucket" 클릭
3. Name: "revenue-proofs" 입력
4. Public bucket 체크
5. Create 클릭`
          },
          { status: 503 }
        );
      }
      
      return NextResponse.json(
        { error: '이미지 업로드 중 오류가 발생했습니다' },
        { status: 500 }
      );
    }
    
    // 공개 URL 생성
    const { data: { publicUrl } } = supabase.storage
      .from('revenue-proofs')
      .getPublicUrl(fileName);
    
    const screenshotUrl = publicUrl;
    
    // DB에 저장
    const { data, error } = await supabase
      .from('revenue_proofs')
      .insert({
        user_id: session.user.id,
        title: validatedData.title,
        content: validatedData.content,
        amount: validatedData.amount,
        platform: validatedData.platform,
        screenshot_url: screenshotUrl,
        screenshot_blur: '', // TODO: blur placeholder 구현
        signature_data: validatedData.signature,
        is_hidden: false,
        likes_count: 0,
        comments_count: 0,
        reports_count: 0
      })
      .select(`
        *,
        user:profiles!revenue_proofs_user_id_fkey(
          id,
          username,
          avatar_url
        )
      `)
      .single();

    if (error) {
      console.error('Database insert error:', error);
      
      // RLS 정책 위반 (일일 제한)
      if (error.code === '42501' && error.message.includes('revenue_proofs_insert_check')) {
        return NextResponse.json(
          { error: '오늘은 이미 인증하셨습니다. 내일 다시 시도해주세요!' },
          { status: 429 }
        );
      }
      
      return NextResponse.json(
        { error: '인증 작성 중 오류가 발생했습니다' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      data,
      message: '수익 인증이 성공적으로 작성되었습니다!'
    }, { status: 201 });

  } catch (error) {
    console.error('API error:', error);
    
    // Zod 검증 에러
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: '입력값이 올바르지 않습니다',
          details: error.flatten()
        },
        { status: 400 }
      );
    }

    // 개발 환경에서는 상세한 에러 메시지 제공
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? `서버 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
      : '서버 오류가 발생했습니다';
    
    return NextResponse.json(
      { 
        error: errorMessage,
        ...(process.env.NODE_ENV === 'development' && {
          details: error instanceof Error ? error.stack : String(error)
        })
      },
      { status: 500 }
    );
  }
}