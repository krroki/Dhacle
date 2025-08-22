'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import ReactCrop, { type Crop } from 'react-image-crop';
import SignatureCanvas from 'react-signature-canvas';
import { ApiError, apiUpload } from '@/lib/api-client';
import 'react-image-crop/dist/ReactCrop.css';
import { AlertTriangle, RefreshCw, Trash2, Upload } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TiptapEditor } from '@/components/ui/tiptap-editor';
import { type CreateProofInput, createProofSchema } from '@/lib/validations/revenue-proof';

export default function CreateRevenueProof() {
  const router = useRouter();
  const sig_canvas = useRef<SignatureCanvas>(null);
  const [show_warning, set_show_warning] = useState(true);
  const [is_submitting, set_is_submitting] = useState(false);
  const [editor_content, set_editor_content] = useState('');
  const [image_preview, set_image_preview] = useState<string>('');
  const [signature_data, set_signature_data] = useState<string>('');
  const [image_file, set_image_file] = useState<File | null>(null);
  const [crop, set_crop] = useState<Crop>();
  const [show_crop_modal, set_show_crop_modal] = useState(false);
  const image_ref = useRef<HTMLImageElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CreateProofInput>({
    resolver: zodResolver(createProofSchema),
  });

  // 이미지 미리보기
  const handle_image_change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 파일 크기 체크
      if (file.size > 5 * 1024 * 1024) {
        alert('파일 크기는 5MB 이하여야 합니다.');
        return;
      }

      // 파일 타입 체크
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        alert('JPG, PNG, WebP 형식만 업로드 가능합니다.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        set_image_preview(reader.result as string);
      };
      reader.readAsDataURL(file);
      set_image_file(file);
      setValue('screenshot', file);
    }
  };

  // 서명 저장
  const save_signature = () => {
    if (sig_canvas.current && !sig_canvas.current.isEmpty()) {
      const data_url = sig_canvas.current.toDataURL();
      set_signature_data(data_url);
      setValue('signature', data_url);
      alert('서명이 저장되었습니다.');
    } else {
      alert('서명을 작성해주세요.');
    }
  };

  // 서명 초기화
  const clear_signature = () => {
    sig_canvas.current?.clear();
    set_signature_data('');
    setValue('signature', '');
  };

  // 폼 제출
  const on_submit = async (data: CreateProofInput) => {
    set_is_submitting(true);

    try {
      // API 호출을 위한 FormData 생성
      const form_data = new FormData();
      form_data.append('title', data.title);
      form_data.append('amount', data.amount.toString());
      form_data.append('platform', data.platform);
      form_data.append('content', data.content);
      form_data.append('signature', data.signature);
      form_data.append('screenshot', data.screenshot);

      // API 호출 (FormData는 apiUpload 사용)
      try {
        const result = await apiUpload<{ message?: string; id?: string }>(
          '/api/revenue-proof',
          form_data
        );

        // 성공 메시지
        alert(result?.message || '수익 인증이 성공적으로 작성되었습니다!');

        // 갤러리로 이동
        router.push('/revenue-proof');
      } catch (error) {
        if (error instanceof ApiError) {
          // 일일 제한 에러 처리
          if (error.status === 429) {
            const error_data = error.data as { error?: string };
            alert(error_data?.error || '일일 작성 제한에 도달했습니다.');
          } else {
            alert(error.message || '인증 작성 중 오류가 발생했습니다.');
          }
        } else {
          alert('인증 작성 중 오류가 발생했습니다.');
        }
        return;
      }
    } finally {
      set_is_submitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 허위 인증 경고 모달 */}
        <AlertDialog open={show_warning} onOpenChange={set_show_warning}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                수익 인증 작성 전 필독사항
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-3">
                <p>
                  수익 인증은 <strong>커뮤니티의 신뢰</strong>를 바탕으로 운영됩니다.
                </p>
                <Alert className="border-red-200 bg-red-50 dark:bg-red-950">
                  <AlertDescription className="text-red-800 dark:text-red-200">
                    ⚠️ 허위 인증 작성 시 다음과 같은 제재가 있을 수 있습니다:
                    <ul className="mt-2 ml-4 list-disc">
                      <li>계정 활동 제한</li>
                      <li>랭킹 및 보상 제외</li>
                      <li>커뮤니티 이용 제한</li>
                    </ul>
                  </AlertDescription>
                </Alert>
                <p className="text-sm">
                  ✅ 실제 수익 스크린샷만 업로드해주세요
                  <br />✅ 본인의 닉네임으로 서명을 추가해주세요
                  <br />✅ 하루에 1회만 인증 가능합니다
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => set_show_warning(false)}>
                확인했습니다
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <h1 className="text-3xl font-bold mb-8">수익 인증 작성</h1>

        <form onSubmit={handleSubmit(on_submit)} className="space-y-6">
          {/* 제목 */}
          <div>
            <Label htmlFor="title">제목 *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="예: 1월 YouTube Shorts 수익 인증"
              className="mt-2"
            />
            {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>}
          </div>

          {/* 플랫폼 선택 */}
          <div>
            <Label htmlFor="platform">플랫폼 *</Label>
            <Select
              onValueChange={(value) =>
                setValue('platform', value as 'youtube' | 'instagram' | 'tiktok')
              }
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="플랫폼을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="youtube">YouTube</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
              </SelectContent>
            </Select>
            {errors.platform && (
              <p className="text-sm text-red-500 mt-1">{errors.platform.message}</p>
            )}
          </div>

          {/* 수익 금액 */}
          <div>
            <Label htmlFor="amount">수익 금액 (원) *</Label>
            <Input
              id="amount"
              type="number"
              {...register('amount', { valueAsNumber: true })}
              placeholder="예: 1500000"
              className="mt-2"
            />
            {errors.amount && <p className="text-sm text-red-500 mt-1">{errors.amount.message}</p>}
          </div>

          {/* 스크린샷 업로드 */}
          <div>
            <Label htmlFor="screenshot">수익 스크린샷 *</Label>
            <div className="mt-2 border-2 border-dashed rounded-lg p-6 text-center">
              {image_preview ? (
                <div className="relative w-full">
                  <Image
                    src={image_preview}
                    alt="스크린샷 미리보기"
                    width={800}
                    height={600}
                    className="max-w-full h-auto mx-auto rounded-lg w-auto"
                    unoptimized={true}
                  />
                  <div className="flex gap-2 justify-center mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => set_show_crop_modal(true)}
                    >
                      이미지 편집
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        set_image_preview('');
                        set_image_file(null);
                        setValue('screenshot', undefined as unknown as File);
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      다시 선택
                    </Button>
                  </div>
                </div>
              ) : (
                <label htmlFor="screenshot" className="cursor-pointer">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">
                    클릭하여 스크린샷을 업로드하세요
                    <br />
                    (JPG, PNG, WebP / 최대 5MB)
                  </p>
                  <input
                    id="screenshot"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handle_image_change}
                  />
                </label>
              )}
            </div>
            {errors.screenshot && (
              <p className="text-sm text-red-500 mt-1">{errors.screenshot.message}</p>
            )}
          </div>

          {/* 서명 추가 */}
          {image_preview && (
            <div>
              <Label>서명 추가 *</Label>
              <p className="text-sm text-muted-foreground mt-1">
                본인의 닉네임이나 서명을 추가해주세요
              </p>
              <div className="mt-2 border rounded-lg p-4 bg-white dark:bg-gray-900">
                <SignatureCanvas
                  ref={sig_canvas}
                  canvasProps={{
                    className: 'border rounded bg-white dark:bg-gray-800 w-full',
                    style: { width: '100%', height: '200px' },
                  }}
                  backgroundColor="white"
                  penColor="black"
                />
                <div className="flex gap-2 mt-2">
                  <Button type="button" variant="outline" size="sm" onClick={clear_signature}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    지우기
                  </Button>
                  <Button type="button" size="sm" onClick={save_signature}>
                    서명 저장
                  </Button>
                </div>
                {signature_data && (
                  <p className="text-sm text-green-600 mt-2">✅ 서명이 저장되었습니다</p>
                )}
              </div>
              {errors.signature && (
                <p className="text-sm text-red-500 mt-1">{errors.signature.message}</p>
              )}
            </div>
          )}

          {/* 상세 내용 (TipTap) */}
          <div>
            <Label>수익 달성 과정 및 노하우 *</Label>
            <p className="text-sm text-muted-foreground mt-1">
              어떻게 수익을 달성했는지 자세히 공유해주세요 (최소 50자)
            </p>
            <div className="mt-2">
              <TiptapEditor
                value={editor_content}
                onChange={(content) => {
                  set_editor_content(content);
                  setValue('content', content);
                }}
                placeholder="수익 달성 과정, 콘텐츠 제작 팁, 채널 운영 노하우 등을 자유롭게 작성해주세요..."
                className="min-h-[300px]"
              />
            </div>
            {errors.content && (
              <p className="text-sm text-red-500 mt-1">{errors.content.message}</p>
            )}
          </div>

          {/* 제출 버튼 */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={is_submitting}
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={is_submitting || !image_file || !signature_data}
              className="flex-1"
            >
              {is_submitting ? '인증 작성 중...' : '수익 인증하기'}
            </Button>
          </div>

          {(!image_file || !signature_data) && (
            <Alert>
              <AlertDescription>
                {!image_file && '스크린샷을 업로드해주세요.'}
                {image_file && !signature_data && '서명을 추가해주세요.'}
              </AlertDescription>
            </Alert>
          )}
        </form>
      </div>

      {/* 이미지 크롭 모달 */}
      {show_crop_modal && image_preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-auto">
            <h3 className="text-lg font-semibold mb-4">이미지 편집</h3>
            <ReactCrop
              crop={crop}
              onChange={(c) => set_crop(c)}
              aspect={16 / 9}
              minWidth={100}
              minHeight={100}
            >
              <Image
                ref={image_ref}
                src={image_preview}
                alt="편집할 이미지"
                width={800}
                height={600}
                className="max-w-full h-auto w-auto"
                unoptimized={true}
              />
            </ReactCrop>
            <div className="flex gap-2 justify-end mt-4">
              <Button type="button" variant="outline" onClick={() => set_show_crop_modal(false)}>
                취소
              </Button>
              <Button
                type="button"
                onClick={() => {
                  // TODO: 크롭된 이미지 적용
                  set_show_crop_modal(false);
                }}
              >
                적용
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
