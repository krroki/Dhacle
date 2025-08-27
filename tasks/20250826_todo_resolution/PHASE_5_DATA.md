/sc:implement --seq --validate --c7
"Phase 5: 더미 데이터를 실제 구현으로 교체"

# Phase 5: 더미 데이터 실제 구현 교체

⚠️ → 상단 '최우선 프로젝트 특화 규칙' 필수 확인
- `/docs/CONTEXT_BRIDGE.md` 전체 읽기
- `/CLAUDE.md` 17-43행 자동 스크립트 금지
- any 타입 사용 금지
- 임시방편 해결책 금지

## 📌 Phase 정보
- Phase 번호: 5/6
- 예상 시간: 2-3일
- 우선순위: 🟡 MEDIUM (데이터 품질 개선)
- 차단 요소: Phase 1-4 완료 필수

## 📚 온보딩 섹션

### 작업 관련 경로
- 더미 데이터: `src/lib/dummy-data/`
- 프로필 페이지: `src/app/mypage/profile/page.tsx`
- API 라우트: `src/app/api/`
- 이미지 업로드: `src/app/api/upload/`

### 프로젝트 컨텍스트 확인
```bash
# 더미 데이터 사용 위치 확인
grep -r "dummy-data" src/ --include="*.tsx" --include="*.ts"

# TODO 주석 확인
grep -r "TODO.*프로필 이미지" src/lib/dummy-data/ --include="*.ts"
grep -r "TODO.*강사 정보" src/lib/dummy-data/ --include="*.ts"

# 이미지 업로드 관련
cat src/app/api/upload/route.ts | head -20
```

### 🔥 실제 코드 패턴 확인
```bash
# API 패턴
grep -r "apiPost.*upload" src/ --include="*.tsx" | head -5

# Supabase Storage 사용 여부
grep -r "storage.from" src/ --include="*.ts" --include="*.tsx"

# 현재 duration/reviewCount 계산 로직
grep -r "total_duration" src/lib/api/courses.ts
```

## 🎯 Phase 목표
1. 프로필 이미지 업로드 시스템 구현
2. 강사 정보 실제 데이터로 교체
3. 코스 메타데이터 계산 로직 구현
4. 더미 데이터 파일 제거

## 📝 작업 내용

### 1️⃣ 프로필 이미지 업로드 시스템

#### Supabase Storage 버킷 생성
```sql
-- File: supabase/migrations/20250826000010_create_storage_buckets.sql

-- 프로필 이미지 버킷 생성 (RLS 활성화)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-images',
  'profile-images', 
  true, -- 공개 버킷
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- 강의 이미지 버킷
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-images',
  'course-images',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- RLS 정책: 자신의 프로필 이미지만 업로드 가능
CREATE POLICY "Users can upload own profile image" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profile-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Public profile images are viewable by everyone" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-images');

CREATE POLICY "Users can update own profile image" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'profile-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own profile image" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'profile-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

#### 프로필 이미지 업로드 API
```typescript
// File: src/app/api/user/profile-image/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server-client';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    
    // 세션 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // 파일 타입 검증
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    // 파일 크기 검증 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 });
    }

    // 기존 이미지 삭제
    const { data: existingFiles } = await supabase.storage
      .from('profile-images')
      .list(user.id, { limit: 10 });

    if (existingFiles && existingFiles.length > 0) {
      const filesToDelete = existingFiles.map(f => `${user.id}/${f.name}`);
      await supabase.storage
        .from('profile-images')
        .remove(filesToDelete);
    }

    // 새 이미지 업로드
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/profile.${fileExt}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('profile-images')
      .upload(fileName, file, {
        upsert: true,
        contentType: file.type
      });

    if (uploadError) throw uploadError;

    // Public URL 생성
    const { data: { publicUrl } } = supabase.storage
      .from('profile-images')
      .getPublicUrl(fileName);

    // 프로필 업데이트
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        avatar_url: publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) throw updateError;

    return NextResponse.json({ 
      success: true, 
      avatar_url: publicUrl 
    });
  } catch (error) {
    console.error('Profile image upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Storage에서 이미지 삭제
    const { data: files } = await supabase.storage
      .from('profile-images')
      .list(user.id);

    if (files && files.length > 0) {
      const filesToDelete = files.map(f => `${user.id}/${f.name}`);
      await supabase.storage
        .from('profile-images')
        .remove(filesToDelete);
    }

    // 프로필에서 URL 제거
    await supabase
      .from('profiles')
      .update({ 
        avatar_url: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Profile image delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    );
  }
}
```

### 2️⃣ 프로필 이미지 업로드 컴포넌트

```typescript
// File: src/components/features/profile/ProfileImageUpload.tsx

'use client';

import { useState } from 'react';
import { apiUpload, apiDelete } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ProfileImageUploadProps {
  currentImageUrl?: string | null;
  userName?: string;
  onUpdate?: (url: string | null) => void;
}

export function ProfileImageUpload({ 
  currentImageUrl, 
  userName = 'User',
  onUpdate 
}: ProfileImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 미리보기 생성
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // 업로드
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiUpload('/api/user/profile-image', formData);
      
      if (response.success) {
        toast({ title: '프로필 이미지가 업데이트되었습니다' });
        setPreviewUrl(response.avatar_url);
        onUpdate?.(response.avatar_url);
      }
    } catch (error) {
      toast({ 
        title: '이미지 업로드 실패',
        description: '파일 크기는 5MB 이하여야 합니다',
        variant: 'destructive'
      });
      setPreviewUrl(currentImageUrl || null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!previewUrl) return;
    
    setIsUploading(true);
    try {
      await apiDelete('/api/user/profile-image');
      
      toast({ title: '프로필 이미지가 삭제되었습니다' });
      setPreviewUrl(null);
      onUpdate?.(null);
    } catch (error) {
      toast({ 
        title: '이미지 삭제 실패',
        variant: 'destructive' 
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-24 w-24">
        <AvatarImage src={previewUrl || undefined} alt={userName} />
        <AvatarFallback>{userName[0]?.toUpperCase()}</AvatarFallback>
      </Avatar>
      
      <div className="flex gap-2">
        <label htmlFor="profile-image-input">
          <input
            id="profile-image-input"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={isUploading}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isUploading}
            onClick={() => document.getElementById('profile-image-input')?.click()}
          >
            <Camera className="mr-2 h-4 w-4" />
            {previewUrl ? '변경' : '업로드'}
          </Button>
        </label>

        {previewUrl && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={isUploading}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            삭제
          </Button>
        )}
      </div>
    </div>
  );
}
```

### 3️⃣ 강사 정보 시스템 구현

```sql
-- File: supabase/migrations/20250826000011_create_instructors_table.sql

-- 강사 정보 테이블
CREATE TABLE IF NOT EXISTS instructors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name VARCHAR(255) NOT NULL,
  bio TEXT,
  expertise TEXT[],
  years_of_experience INTEGER,
  company VARCHAR(255),
  position VARCHAR(255),
  linkedin_url VARCHAR(500),
  github_url VARCHAR(500),
  website_url VARCHAR(500),
  avatar_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE,
  rating DECIMAL(3,2) DEFAULT 0.00, -- 평균 평점
  total_students INTEGER DEFAULT 0,
  total_courses INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 정책
ALTER TABLE instructors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read for instructors" ON instructors
  FOR SELECT USING (true);

CREATE POLICY "Users can update own instructor profile" ON instructors
  FOR UPDATE USING (auth.uid() = user_id);

-- 인덱스
CREATE INDEX idx_instructors_user_id ON instructors(user_id);
CREATE INDEX idx_instructors_verified ON instructors(is_verified);
```

### 4️⃣ 코스 메타데이터 계산 로직

```typescript
// File: src/lib/api/courses.ts 수정

import { createSupabaseServerClient } from '@/lib/supabase/server-client';

export async function getCourseWithMetadata(courseId: string) {
  const supabase = await createSupabaseServerClient();
  
  // 코스 기본 정보 조회
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select(`
      *,
      course_categories (
        category
      ),
      instructors (
        id,
        display_name,
        bio,
        avatar_url
      )
    `)
    .eq('id', courseId)
    .single();

  if (courseError || !course) throw courseError;

  // 레슨 정보로 총 시간 계산
  const { data: lessons } = await supabase
    .from('course_lessons')
    .select('duration')
    .eq('course_id', courseId);

  const totalDuration = lessons?.reduce((acc, lesson) => {
    return acc + (lesson.duration || 0);
  }, 0) || 0;

  // 리뷰 수 계산
  const { count: reviewCount } = await supabase
    .from('course_reviews')
    .select('*', { count: 'exact', head: true })
    .eq('course_id', courseId);

  // 평균 평점 계산
  const { data: ratingData } = await supabase
    .from('course_reviews')
    .select('rating')
    .eq('course_id', courseId);

  const averageRating = ratingData?.length 
    ? ratingData.reduce((acc, r) => acc + r.rating, 0) / ratingData.length
    : 0;

  // 완성된 데이터 반환
  return {
    ...course,
    total_duration: totalDuration,
    reviewCount: reviewCount || 0,
    averageRating: Math.round(averageRating * 10) / 10,
    instructor: course.instructors?.[0] || null
  };
}

// 강사별 코스 목록
export async function getInstructorCourses(instructorId: string) {
  const supabase = await createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from('courses')
    .select(`
      *,
      course_categories (category),
      course_reviews (rating)
    `)
    .eq('instructor_id', instructorId)
    .eq('is_published', true);

  if (error) throw error;

  // 각 코스에 메타데이터 추가
  const coursesWithMetadata = await Promise.all(
    data.map(async (course) => {
      const { count } = await supabase
        .from('course_enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', course.id);

      const avgRating = course.course_reviews?.length
        ? course.course_reviews.reduce((acc, r) => acc + r.rating, 0) / course.course_reviews.length
        : 0;

      return {
        ...course,
        studentCount: count || 0,
        averageRating: Math.round(avgRating * 10) / 10,
        reviewCount: course.course_reviews?.length || 0
      };
    })
  );

  return coursesWithMetadata;
}
```

### 5️⃣ 더미 데이터 파일 제거 및 실제 데이터 사용

```typescript
// File: src/app/(pages)/home/page.tsx 수정 예시

import { createSupabaseServerClient } from '@/lib/supabase/server-client';
import { HomeHero } from '@/components/features/home/HomeHero';
import { CourseGrid } from '@/components/features/courses/CourseGrid';

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
  
  // 실제 인기 코스 조회
  const { data: popularCourses } = await supabase
    .from('courses')
    .select(`
      *,
      instructors (
        display_name,
        avatar_url
      ),
      course_enrollments (count)
    `)
    .eq('is_published', true)
    .order('enrollment_count', { ascending: false })
    .limit(8);

  // 실제 신규 코스 조회
  const { data: newCourses } = await supabase
    .from('courses')
    .select(`
      *,
      instructors (
        display_name,
        avatar_url
      )
    `)
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(4);

  // 실제 강사 정보 조회
  const { data: instructors } = await supabase
    .from('instructors')
    .select('*')
    .eq('is_verified', true)
    .order('rating', { ascending: false })
    .limit(6);

  return (
    <>
      <HomeHero />
      
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">인기 코스</h2>
          <CourseGrid courses={popularCourses || []} />
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">신규 코스</h2>
          <CourseGrid courses={newCourses || []} />
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">우수 강사진</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {instructors?.map((instructor) => (
              <InstructorCard key={instructor.id} instructor={instructor} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
```

## ✅ 완료 조건

### 🔴 필수 완료 조건 (하나라도 미충족 시 미완료)
```bash
# 1. 빌드 성공
- [ ] npm run build → 성공
- [ ] npm run types:check → 에러 0개

# 2. 데이터베이스 확인
- [ ] Storage 버킷 생성 확인
- [ ] instructors 테이블 생성 확인
- [ ] RLS 정책 적용 확인

# 3. 실제 브라우저 테스트
- [ ] npm run dev → http://localhost:3000
- [ ] 프로필 페이지에서 이미지 업로드 테스트
- [ ] 이미지 변경/삭제 테스트
- [ ] 코스 상세 페이지에서 실제 duration 표시 확인
- [ ] 강사 정보 실제 데이터 표시 확인
- [ ] 개발자 도구 Console → 에러 0개
- [ ] Network 탭 → 이미지 업로드 성공
```

### 🟡 권장 완료 조건
- [ ] 이미지 최적화 (리사이징, 압축)
- [ ] 로딩 상태 표시
- [ ] 에러 처리 개선
- [ ] 캐싱 전략 구현

### 🟢 선택 완료 조건
- [ ] 이미지 크롭 기능
- [ ] 드래그 앤 드롭 업로드
- [ ] 이미지 미리보기 갤러리

## 🔄 롤백 계획
```bash
# 실패 시 롤백
git reset --hard HEAD~1

# Storage 버킷 삭제 (필요시)
# Supabase Dashboard에서 수동 삭제

# 환경 재구성
npm install
npm run build
```

## → 다음 Phase
- 파일: PHASE_6_FEATURES.md
- 내용: 부가 기능 구현 (뉴스레터, 검색, 에러 리포팅 등)