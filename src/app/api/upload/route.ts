// upload/route.ts
// 이미지 업로드 및 최적화 API

// Use Node.js runtime for Supabase compatibility
export const runtime = 'nodejs';

import { requireAuth } from '@/lib/api-auth';
import { logger } from '@/lib/logger';
import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
import { type NextRequest, NextResponse } from 'next/server';

// 이미지 타입 검증
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// 최대 파일 크기 (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// POST: 이미지 업로드
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Step 1: Authentication check (required!)
    const user = await requireAuth(request);
    if (!user) {
      logger.warn('Unauthorized access attempt to Upload API');
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const supabase = await createSupabaseRouteHandlerClient();

    // FormData 파싱
    const form_data = await request.formData();
    const file = form_data.get('file') as File;
    const bucket = (form_data.get('bucket') as string) || 'revenue-proofs';

    if (!file) {
      return NextResponse.json({ error: '파일이 없습니다' }, { status: 400 });
    }

    // 파일 타입 검증
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'JPG, PNG, WebP 형식만 업로드 가능합니다' },
        { status: 400 }
      );
    }

    // 파일 크기 검증
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: '파일 크기는 5MB 이하여야 합니다' }, { status: 400 });
    }

    // 파일명 생성 (사용자ID_타임스탬프_원본파일명)
    const timestamp = Date.now();
    const file_ext = file.name.split('.').pop();
    const file_name = `${user.id}_${timestamp}.${file_ext}`;
    const file_path = `${new Date().getFullYear()}/${new Date().getMonth() + 1}/${file_name}`;

    // ArrayBuffer를 Uint8Array로 변환
    const array_buffer = await file.arrayBuffer();
    const uint8_array = new Uint8Array(array_buffer);

    // Supabase Storage에 업로드
    const { error: upload_error } = await supabase.storage
      .from(bucket)
      .upload(file_path, uint8_array, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      });

    if (upload_error) {
      // 버킷이 없는 경우
      if (upload_error.message.includes('bucket')) {
        return NextResponse.json(
          { error: 'Storage 버킷이 설정되지 않았습니다. 관리자에게 문의하세요.' },
          { status: 500 }
        );
      }

      return NextResponse.json({ error: '이미지 업로드 중 오류가 발생했습니다' }, { status: 500 });
    }

    // Public URL 생성
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(file_path);

    // 썸네일 URL 생성 (Supabase 이미지 변환 기능 사용)
    // ?width=320&height=240&resize=cover
    const thumbnail_url = `${publicUrl}?width=320&height=240&resize=cover`;

    // Blur placeholder 생성 (base64 - 간단한 구현)
    // 실제로는 sharp 등의 라이브러리를 사용해야 함
    const blur_data_url = await generate_blur_data_url(file);

    return NextResponse.json({
      url: publicUrl,
      thumbnail_url,
      blurDataUrl: blur_data_url,
      path: file_path,
      size: file.size,
      type: file.type,
      name: file.name,
    });
  } catch (error) {
    logger.error('API error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}

// DELETE: 이미지 삭제
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    // Step 1: Authentication check (required!)
    const user = await requireAuth(request);
    if (!user) {
      logger.warn('Unauthorized access attempt to Upload API');
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const supabase = await createSupabaseRouteHandlerClient();

    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');
    const bucket = searchParams.get('bucket') || 'revenue-proofs';

    if (!path) {
      return NextResponse.json({ error: '파일 경로가 필요합니다' }, { status: 400 });
    }

    // 파일 경로에 사용자 ID가 포함되어 있는지 확인 (보안)
    if (!path.includes(user.id)) {
      return NextResponse.json({ error: '삭제 권한이 없습니다' }, { status: 403 });
    }

    // Supabase Storage에서 삭제
    const { error: delete_error } = await supabase.storage.from(bucket).remove([path]);

    if (delete_error) {
      return NextResponse.json({ error: '이미지 삭제 중 오류가 발생했습니다' }, { status: 500 });
    }

    return NextResponse.json({
      message: '이미지가 삭제되었습니다',
    });
  } catch (error) {
    logger.error('API error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}

// Blur placeholder 생성 함수 (간단한 구현)
async function generate_blur_data_url(_file: File): Promise<string> {
  // 실제로는 sharp 등을 사용해 작은 이미지를 생성하고 base64로 인코딩
  // 여기서는 간단한 placeholder 반환

  // Canvas를 사용한 간단한 blur 생성 (서버사이드에서는 실제로 작동하지 않음)
  // 실제 구현시 sharp 라이브러리 사용 권장

  // 임시로 작은 base64 이미지 반환
  return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAKAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==';
}
