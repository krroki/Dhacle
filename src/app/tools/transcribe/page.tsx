'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser-client';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { User } from '@supabase/supabase-js';

// Enhanced state types for better UX feedback
type DetailedStatus = 
  | 'idle' 
  | 'checking_auth'
  | 'file_selected' 
  | 'validating_file'
  | 'uploading' 
  | 'upload_failed'
  | 'processing' 
  | 'processing_failed'
  | 'completed' 
  | 'download_ready'
  | 'auth_required';

interface StatusMessage {
  type: 'success' | 'warning' | 'destructive' | 'info';
  title?: string;
  message: string;
}

const statusMessages: Record<DetailedStatus, StatusMessage | null> = {
  idle: null,
  checking_auth: { type: 'info', message: '인증 상태를 확인하고 있습니다...' },
  file_selected: { type: 'info', title: '파일 선택됨', message: '자막 생성 시작 버튼을 클릭해주세요.' },
  validating_file: { type: 'info', message: '파일을 검증하고 있습니다...' },
  uploading: { type: 'warning', title: '업로드 중', message: '파일을 업로드하고 있습니다. 잠시만 기다려주세요...' },
  upload_failed: { type: 'destructive', title: '업로드 실패', message: '파일 업로드에 실패했습니다. 다시 시도해주세요.' },
  processing: { type: 'warning', title: '자막 생성 중', message: 'AI가 오디오를 분석하고 있습니다. 최대 3분 정도 소요될 수 있습니다...' },
  processing_failed: { type: 'destructive', title: '처리 실패', message: '자막 생성에 실패했습니다. 다시 시도해주세요.' },
  completed: { type: 'success', title: '완료!', message: '자막이 성공적으로 생성되었습니다.' },
  download_ready: { type: 'success', title: '다운로드 준비 완료', message: 'SRT 파일을 다운로드할 수 있습니다.' },
  auth_required: { type: 'warning', title: '로그인 필요', message: '이 기능을 사용하려면 먼저 로그인해주세요.' },
};

export default function TranscribePage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<DetailedStatus>('checking_auth');
  const [customError, setCustomError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    // Check if user is logged in
    const initializeAuth = async () => {
      setStatus('checking_auth');
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        
        setUser(user);
        setStatus(user ? 'idle' : 'auth_required');
      } catch (error) {
        console.error('Auth check failed:', error);
        setStatus('auth_required');
      }
    };
    
    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user && status !== 'auth_required') {
        setStatus('auth_required');
      } else if (session?.user && status === 'auth_required') {
        setStatus('idle');
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth, status]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (user) {
      setIsDragging(true);
    }
  }, [user]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (!user) {
      setStatus('auth_required');
      return;
    }
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && isAudioOrVideo(droppedFile)) {
      setFile(droppedFile);
      setStatus('file_selected');
      setCustomError(null);
    } else {
      setCustomError('지원되지 않는 파일 형식입니다. 오디오 또는 비디오 파일을 선택해주세요.');
    }
  }, [user]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) {
      setStatus('auth_required');
      return;
    }

    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setStatus('validating_file');
      
      // Validate file
      if (!isAudioOrVideo(selectedFile)) {
        setCustomError('지원되지 않는 파일 형식입니다.');
        setStatus('idle');
        return;
      }
      
      // Check file size (50MB limit)
      if (selectedFile.size > 50 * 1024 * 1024) {
        setCustomError('파일 크기는 50MB를 초과할 수 없습니다.');
        setStatus('idle');
        return;
      }
      
      setFile(selectedFile);
      setStatus('file_selected');
      setCustomError(null);
    }
  };

  const isAudioOrVideo = (file: File) => {
    const audioTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/ogg', 'audio/webm'];
    const videoTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm', 'video/mkv'];
    return audioTypes.includes(file.type) || videoTypes.includes(file.type) || 
           file.name.match(/\.(mp3|wav|m4a|ogg|mp4|avi|mov|wmv|webm|mkv)$/i);
  };

  const handleUpload = async () => {
    if (!file || !user) {
      if (!user) {
        setStatus('auth_required');
      }
      return;
    }

    setIsLoading(true);
    setCustomError(null);
    
    try {
      // Start upload
      setStatus('uploading');
      setUploadProgress(0);

      // Generate unique file path
      const timestamp = Date.now();
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${user.id}/${timestamp}_${sanitizedFileName}`;

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (uploadError) {
        throw new Error(`업로드 실패: ${uploadError.message}`);
      }

      // Process with Edge Function
      setStatus('processing');
      
      const { data, error: functionError } = await supabase.functions.invoke('transcribe', {
        body: {
          filePath,
          userId: user.id,
        },
      });

      if (functionError) {
        throw new Error(`처리 실패: ${functionError.message}`);
      }

      if (!data?.success) {
        throw new Error(data?.error || '자막 생성에 실패했습니다.');
      }

      // Success!
      setDownloadUrl(data.downloadUrl);
      setStatus('download_ready');
      
    } catch (err) {
      console.error('Error:', err);
      setCustomError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      
      if (status === 'uploading') {
        setStatus('upload_failed');
      } else if (status === 'processing') {
        setStatus('processing_failed');
      }
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  const handleDownload = () => {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank');
    }
  };

  const resetUpload = () => {
    setFile(null);
    setUploadProgress(0);
    setDownloadUrl(null);
    setCustomError(null);
    setStatus(user ? 'idle' : 'auth_required');
    setIsLoading(false);
  };

  const handleLoginRedirect = () => {
    router.push('/');
  };

  // Get current status message
  const currentStatusMessage = statusMessages[status];

  return (
    <div className="min-h-screen bg-background pt-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-primary mb-4">
          AI 자막 생성기
        </h1>
        <p className="text-xl text-primary/80 mb-8">
          오디오/비디오 파일을 업로드하면 AI가 자동으로 자막을 생성합니다.
        </p>

        {/* Status Alerts */}
        {currentStatusMessage && (
          <Alert 
            variant={currentStatusMessage.type}
            title={currentStatusMessage.title}
            description={currentStatusMessage.message}
            className="mb-6"
          />
        )}

        {/* Custom Error Alert */}
        {customError && (
          <Alert 
            variant="destructive"
            title="오류"
            description={customError}
            onClose={() => setCustomError(null)}
            className="mb-6"
          />
        )}

        {/* Auth Required State */}
        {status === 'auth_required' && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center mb-8">
            <svg className="w-16 h-16 mx-auto mb-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h2 className="text-2xl font-semibold text-primary mb-4">로그인이 필요합니다</h2>
            <p className="text-primary/80 mb-6">
              AI 자막 생성기를 사용하려면 먼저 로그인해주세요.
            </p>
            <Button onClick={handleLoginRedirect} size="lg">
              로그인 페이지로 이동
            </Button>
          </div>
        )}

        {/* File Upload Area - Only show when authenticated */}
        {user && (
          <div
            className={`
              relative border-2 border-dashed rounded-lg p-12 text-center transition-all
              ${isDragging ? 'border-accent bg-accent/10' : 'border-white/20 bg-white/5'}
              ${file ? 'border-green-500 bg-green-500/10' : ''}
              ${isLoading ? 'opacity-50 pointer-events-none' : ''}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {!file ? (
              <>
                <svg className="w-16 h-16 mx-auto mb-4 text-primary/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-xl text-primary mb-2">
                  파일을 드래그하여 놓거나 클릭하여 선택하세요
                </p>
                <p className="text-sm text-primary/60">
                  지원 형식: MP3, WAV, M4A, MP4, AVI, MOV (최대 50MB)
                </p>
                <input
                  type="file"
                  accept="audio/*,video/*"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isLoading}
                />
              </>
            ) : (
              <div className="space-y-4">
                <svg className="w-16 h-16 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-xl text-primary mb-2">선택된 파일:</p>
                  <p className="text-lg font-semibold text-accent">{file.name}</p>
                  <p className="text-sm text-primary/60 mt-1">
                    크기: {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Upload Progress */}
        {status === 'uploading' && uploadProgress > 0 && (
          <div className="mt-6">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-primary/80">업로드 진행률</span>
              <span className="text-sm text-primary/80">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className="bg-accent h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Download Section */}
        {status === 'download_ready' && downloadUrl && (
          <div className="mt-6 p-6 bg-green-500/10 border border-green-500/50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg text-green-400 font-semibold">✅ 자막 생성 완료!</p>
                <p className="text-sm text-primary/80 mt-1">SRT 파일이 준비되었습니다.</p>
              </div>
              <Button 
                onClick={handleDownload}
                className="bg-green-500 hover:bg-green-600"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                자막 다운로드
              </Button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {user && (
          <div className="mt-8 flex gap-4">
            {file && !isLoading && status !== 'download_ready' && (
              <Button 
                onClick={handleUpload}
                className="flex-1"
                disabled={isLoading || status === 'processing' || status === 'uploading'}
              >
                {isLoading ? '처리 중...' : '자막 생성 시작'}
              </Button>
            )}
            {(file || status !== 'idle') && (
              <Button 
                onClick={resetUpload}
                variant="outline"
                className="flex-1"
                disabled={isLoading && status !== 'download_ready'}
              >
                다시 시작
              </Button>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="mt-12 p-6 bg-white/5 border border-white/10 rounded-lg">
          <h3 className="text-lg font-semibold text-primary mb-3">사용 방법</h3>
          <ol className="space-y-2 text-sm text-primary/80">
            <li className="flex items-start">
              <span className="text-accent mr-2">1.</span>
              카카오 계정으로 로그인합니다.
            </li>
            <li className="flex items-start">
              <span className="text-accent mr-2">2.</span>
              오디오 또는 비디오 파일을 드래그 앤 드롭하거나 클릭하여 선택합니다.
            </li>
            <li className="flex items-start">
              <span className="text-accent mr-2">3.</span>
              &ldquo;자막 생성 시작&rdquo; 버튼을 클릭합니다.
            </li>
            <li className="flex items-start">
              <span className="text-accent mr-2">4.</span>
              AI가 음성을 분석하여 자막을 생성합니다 (1-3분 소요).
            </li>
            <li className="flex items-start">
              <span className="text-accent mr-2">5.</span>
              생성된 SRT 자막 파일을 다운로드합니다.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}