import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server-client';

export async function POST(req: NextRequest) {
  try {
    // 사용자 인증 확인
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 관리자 권한 확인
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // 환경 변수 확인
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const streamToken = process.env.CLOUDFLARE_STREAM_TOKEN;
    const subdomain = process.env.CLOUDFLARE_CUSTOMER_SUBDOMAIN;

    if (!accountId || !streamToken) {
      return NextResponse.json(
        { error: 'Cloudflare Stream configuration missing' },
        { status: 500 }
      );
    }

    // 폼 데이터에서 비디오 파일 추출
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const courseId = formData.get('courseId') as string;
    const lessonId = formData.get('lessonId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No video file provided' },
        { status: 400 }
      );
    }

    // 파일 크기 확인 (최대 5GB)
    const MAX_SIZE = 5 * 1024 * 1024 * 1024; // 5GB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 5GB limit' },
        { status: 400 }
      );
    }

    // Cloudflare Stream으로 비디오 업로드
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    
    // 메타데이터 추가
    if (title) {
      uploadFormData.append('meta', JSON.stringify({
        name: title,
        courseId: courseId,
        lessonId: lessonId,
        uploadedBy: user.id,
        uploadedAt: new Date().toISOString()
      }));
    }

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${streamToken}`,
        },
        body: uploadFormData
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Cloudflare Stream upload error:', error);
      return NextResponse.json(
        { error: 'Failed to upload video to Cloudflare Stream' },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (!data.success || !data.result) {
      return NextResponse.json(
        { error: 'Invalid response from Cloudflare Stream' },
        { status: 500 }
      );
    }

    // HLS 스트리밍 URL 생성
    const hlsUrl = subdomain 
      ? `https://${subdomain}.cloudflarestream.com/${data.result.uid}/manifest/video.m3u8`
      : `https://customer-xxxxx.cloudflarestream.com/${data.result.uid}/manifest/video.m3u8`;

    // 썸네일 URL
    const thumbnailUrl = `https://customer-xxxxx.cloudflarestream.com/${data.result.uid}/thumbnails/thumbnail.jpg`;

    // 데이터베이스에 비디오 정보 저장 (옵션)
    if (lessonId) {
      const { error: dbError } = await supabase
        .from('lessons')
        .update({
          video_url: hlsUrl,
          video_id: data.result.uid,
          thumbnail_url: thumbnailUrl,
          duration: data.result.duration || 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', lessonId);

      if (dbError) {
        console.error('Database update error:', dbError);
        // 비디오는 업로드되었지만 DB 업데이트 실패
        // 에러를 반환하지 않고 경고만 포함
      }
    }

    return NextResponse.json({
      success: true,
      videoId: data.result.uid,
      hlsUrl: hlsUrl,
      thumbnailUrl: thumbnailUrl,
      playback: {
        hls: hlsUrl,
        dash: `https://customer-xxxxx.cloudflarestream.com/${data.result.uid}/manifest/video.mpd`,
      },
      duration: data.result.duration,
      size: data.result.size,
      status: data.result.status,
      meta: data.result.meta
    });

  } catch (error) {
    console.error('Video upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error during video upload' },
      { status: 500 }
    );
  }
}

// 파일 업로드 크기 제한 설정
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '5gb',
    },
  },
};