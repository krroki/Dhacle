'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import SignatureCanvas from 'react-signature-canvas';
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { TiptapEditor } from '@/components/ui/tiptap-editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { createProofSchema, type CreateProofInput } from '@/lib/validations/revenue-proof';
import { AlertTriangle, Upload, Trash2, RefreshCw } from 'lucide-react';

export default function CreateRevenueProof() {
  const router = useRouter();
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [showWarning, setShowWarning] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editorContent, setEditorContent] = useState('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [signatureData, setSignatureData] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [showCropModal, setShowCropModal] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm<CreateProofInput>({
    resolver: zodResolver(createProofSchema)
  });

  // 이미지 미리보기
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setImageFile(file);
      setValue('screenshot', file);
    }
  };

  // 서명 저장
  const saveSignature = () => {
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      const dataUrl = sigCanvas.current.toDataURL();
      setSignatureData(dataUrl);
      setValue('signature', dataUrl);
      alert('서명이 저장되었습니다.');
    } else {
      alert('서명을 작성해주세요.');
    }
  };

  // 서명 초기화
  const clearSignature = () => {
    sigCanvas.current?.clear();
    setSignatureData('');
    setValue('signature', '');
  };

  // 폼 제출
  const onSubmit = async (data: CreateProofInput) => {
    setIsSubmitting(true);
    
    try {
      // API 호출을 위한 FormData 생성
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('amount', data.amount.toString());
      formData.append('platform', data.platform);
      formData.append('content', data.content);
      formData.append('signature', data.signature);
      formData.append('screenshot', data.screenshot);
      
      // API 호출
      const response = await fetch('/api/revenue-proof', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        // 일일 제한 에러 처리
        if (response.status === 429) {
          alert(result.error);
        } else {
          alert(result.error || '인증 작성 중 오류가 발생했습니다.');
        }
        return;
      }
      
      // 성공 메시지
      alert(result.message || '수익 인증이 성공적으로 작성되었습니다!');
      
      // 갤러리로 이동
      router.push('/revenue-proof');
    } catch (error) {
      console.error('Submit error:', error);
      alert('인증 작성 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 허위 인증 경고 모달 */}
        <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                수익 인증 작성 전 필독사항
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-3">
                <p>수익 인증은 <strong>커뮤니티의 신뢰</strong>를 바탕으로 운영됩니다.</p>
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
                  ✅ 실제 수익 스크린샷만 업로드해주세요<br/>
                  ✅ 본인의 닉네임으로 서명을 추가해주세요<br/>
                  ✅ 하루에 1회만 인증 가능합니다
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setShowWarning(false)}>
                확인했습니다
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <h1 className="text-3xl font-bold mb-8">수익 인증 작성</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* 제목 */}
          <div>
            <Label htmlFor="title">제목 *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="예: 1월 YouTube Shorts 수익 인증"
              className="mt-2"
            />
            {errors.title && (
              <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* 플랫폼 선택 */}
          <div>
            <Label htmlFor="platform">플랫폼 *</Label>
            <Select onValueChange={(value) => setValue('platform', value as 'youtube' | 'instagram' | 'tiktok')}>
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
            {errors.amount && (
              <p className="text-sm text-red-500 mt-1">{errors.amount.message}</p>
            )}
          </div>

          {/* 스크린샷 업로드 */}
          <div>
            <Label htmlFor="screenshot">수익 스크린샷 *</Label>
            <div className="mt-2 border-2 border-dashed rounded-lg p-6 text-center">
              {imagePreview ? (
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="스크린샷 미리보기" 
                    className="max-w-full h-auto mx-auto rounded-lg"
                  />
                  <div className="flex gap-2 justify-center mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCropModal(true)}
                    >
                      이미지 편집
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setImagePreview('');
                        setImageFile(null);
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
                    클릭하여 스크린샷을 업로드하세요<br/>
                    (JPG, PNG, WebP / 최대 5MB)
                  </p>
                  <input
                    id="screenshot"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              )}
            </div>
            {errors.screenshot && (
              <p className="text-sm text-red-500 mt-1">{errors.screenshot.message}</p>
            )}
          </div>

          {/* 서명 추가 */}
          {imagePreview && (
            <div>
              <Label>서명 추가 *</Label>
              <p className="text-sm text-muted-foreground mt-1">
                본인의 닉네임이나 서명을 추가해주세요
              </p>
              <div className="mt-2 border rounded-lg p-4 bg-white dark:bg-gray-900">
                <SignatureCanvas
                  ref={sigCanvas}
                  canvasProps={{
                    className: 'border rounded bg-white dark:bg-gray-800 w-full',
                    style: { width: '100%', height: '200px' }
                  }}
                  backgroundColor="white"
                  penColor="black"
                />
                <div className="flex gap-2 mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={clearSignature}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    지우기
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={saveSignature}
                  >
                    서명 저장
                  </Button>
                </div>
                {signatureData && (
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
                value={editorContent}
                onChange={(content) => {
                  setEditorContent(content);
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
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !imageFile || !signatureData}
              className="flex-1"
            >
              {isSubmitting ? '인증 작성 중...' : '수익 인증하기'}
            </Button>
          </div>

          {(!imageFile || !signatureData) && (
            <Alert>
              <AlertDescription>
                {!imageFile && '스크린샷을 업로드해주세요.'} 
                {imageFile && !signatureData && '서명을 추가해주세요.'}
              </AlertDescription>
            </Alert>
          )}
        </form>
      </div>

      {/* 이미지 크롭 모달 */}
      {showCropModal && imagePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-auto">
            <h3 className="text-lg font-semibold mb-4">이미지 편집</h3>
            <ReactCrop 
              crop={crop} 
              onChange={c => setCrop(c)}
              aspect={16/9}
              minWidth={100}
              minHeight={100}
            >
              <img 
                ref={imageRef}
                src={imagePreview} 
                alt="편집할 이미지"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </ReactCrop>
            <div className="flex gap-2 justify-end mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCropModal(false)}
              >
                취소
              </Button>
              <Button
                type="button"
                onClick={() => {
                  // TODO: 크롭된 이미지 적용
                  setShowCropModal(false);
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