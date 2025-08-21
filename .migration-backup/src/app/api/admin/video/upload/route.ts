import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // 인증 확인
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // 관리자 권한 확인
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
    }

    // 환경 변수 확인
    const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
    const STREAM_TOKEN = process.env.CLOUDFLARE_STREAM_TOKEN;
    const CUSTOMER_SUBDOMAIN = process.env.CLOUDFLARE_CUSTOMER_SUBDOMAIN;

    if (!ACCOUNT_ID || !STREAM_TOKEN) {
      return NextResponse.json(
        { error: 'Cloudflare Stream이 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    // 폼 데이터 파싱
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const courseId = formData.get('courseId') as string;
    const lessonId = formData.get('lessonId') as string;

    if (!file) {
      return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 });
    }

    // 파일 크기 제한 (5GB)
    const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024; // 5GB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: '파일 크기는 5GB를 초과할 수 없습니다.' }, { status: 400 });
    }

    // 파일 타입 확인
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: '지원하지 않는 파일 형식입니다. MP4, WebM, MOV, AVI만 지원합니다.' },
        { status: 400 }
      );
    }

    // Cloudflare Stream에 직접 업로드
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    // 메타데이터 추가
    if (courseId) {
      uploadFormData.append(
        'meta',
        JSON.stringify({
          courseId,
          lessonId,
          uploadedBy: user.id,
          uploadedAt: new Date().toISOString(),
        })
      );
    }

    // 워터마크 설정 (선택사항)
    uploadFormData.append(
      'watermark',
      JSON.stringify({
        uid: 'default-watermark',
        position: 'topright',
        opacity: 0.3,
      })
    );

    // Cloudflare Stream API 호출
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/stream`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${STREAM_TOKEN}`,
        },
        body: uploadFormData,
      }
    );

    if (!response.ok) {
      const _errorText = await response.text();
      return NextResponse.json(
        { error: 'Cloudflare Stream 업로드에 실패했습니다.' },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (!data.success || !data.result) {
      return NextResponse.json({ error: '비디오 업로드 처리에 실패했습니다.' }, { status: 500 });
    }

    const videoInfo = data.result;

    // HLS URL 구성
    const hlsUrl = CUSTOMER_SUBDOMAIN
      ? `https://${CUSTOMER_SUBDOMAIN}.cloudflarestream.com/${videoInfo.uid}/manifest/video.m3u8`
      : `https://videodelivery.net/${videoInfo.uid}/manifest/video.m3u8`;

    // 썸네일 URL
    const thumbnailUrl = `https://videodelivery.net/${videoInfo.uid}/thumbnails/thumbnail.jpg`;

    // 레슨 정보 업데이트 (lessonId가 제공된 경우)
    if (lessonId) {
      const { error: updateError } = await supabase
        .from('lessons')
        .update({
          videoUrl: hlsUrl,
          thumbnail_url: thumbnailUrl,
          cloudflareVideoId: videoInfo.uid,
          duration: videoInfo.duration || 0,
          updated_at: new Date().toISOString(),
        })
        .eq('id', lessonId);

      if (updateError) {
        // 업로드는 성공했으므로 에러를 반환하지 않고 경고만 포함
      }
    }

    return NextResponse.json({
      success: true,
      videoId: videoInfo.uid,
      hlsUrl,
      thumbnailUrl,
      dashUrl: `https://videodelivery.net/${videoInfo.uid}/manifest/video.mpd`,
      embedUrl: `https://iframe.videodelivery.net/${videoInfo.uid}`,
      duration: videoInfo.duration,
      status: videoInfo.status,
      message: '비디오 업로드가 완료되었습니다.',
    });
  } catch (_error) {
    return NextResponse.json({ error: '비디오 업로드 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

// 업로드 상태 확인 API
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const videoId = searchParams.get('videoId');

    if (!videoId) {
      return NextResponse.json({ error: '비디오 ID가 필요합니다.' }, { status: 400 });
    }

    const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
    const STREAM_TOKEN = process.env.CLOUDFLARE_STREAM_TOKEN;

    if (!ACCOUNT_ID || !STREAM_TOKEN) {
      return NextResponse.json(
        { error: 'Cloudflare Stream이 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    // Cloudflare Stream에서 비디오 상태 확인
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/stream/${videoId}`,
      {
        headers: {
          Authorization: `Bearer ${STREAM_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: '비디오 정보를 가져올 수 없습니다.' },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (!data.success || !data.result) {
      return NextResponse.json({ error: '비디오 정보가 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      video: {
        id: data.result.uid,
        status: data.result.status,
        duration: data.result.duration,
        size: data.result.size,
        ready: data.result.status?.state === 'ready',
        percentComplete: data.result.status?.pctComplete || 0,
        thumbnail: `https://videodelivery.net/${data.result.uid}/thumbnails/thumbnail.jpg`,
      },
    });
  } catch (_error) {
    return NextResponse.json(
      { error: '비디오 상태 확인 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
