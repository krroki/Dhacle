'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams?.get('error') || null;
  const errorDescription = searchParams?.get('error_description') || null;
  
  // 에러 메시지 매핑
  const getErrorMessage = () => {
    if (errorDescription) return errorDescription;
    
    switch (error) {
      case 'access_denied':
        return '로그인이 취소되었습니다.';
      case 'server_error':
        return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      case 'temporarily_unavailable':
        return '일시적으로 서비스를 사용할 수 없습니다.';
      default:
        return '로그인 중 오류가 발생했습니다.';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            로그인 오류
          </h2>
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">
              {getErrorMessage()}
            </p>
            {error && (
              <p className="text-sm text-red-600 mt-2">
                에러 코드: {error}
              </p>
            )}
          </div>
          
          <div className="mt-8 space-y-4">
            <Link 
              href="/"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              다시 시도하기
            </Link>
            
            <div className="text-sm text-gray-600">
              <p>문제가 지속되면 고객센터로 문의해주세요.</p>
              <p className="mt-1">dhacle.help@gmail.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">로딩 중...</div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
}