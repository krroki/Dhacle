'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestErrorPage() {
  const [error, setError] = useState<string>('');

  // console.error는 테스트 시에만 활성화
  useEffect(() => {
    // console.error('테스트: Console 에러 메시지');
  }, []);

  // 런타임 에러 발생 함수들
  const throwJavaScriptError = () => {
    throw new Error('테스트: JavaScript 런타임 에러');
  };

  const throwTypeError = () => {
    // @ts-ignore - 의도적인 타입 에러
    const obj = null;
    obj.property; // TypeError 발생
  };

  const throwReferenceError = () => {
    // @ts-ignore - 의도적인 참조 에러
    nonExistentVariable; // ReferenceError 발생
  };

  const throwAsyncError = async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    throw new Error('테스트: 비동기 에러');
  };

  const causeReactError = () => {
    setError('trigger');
  };

  // React 렌더링 에러 (error가 'trigger'일 때)
  if (error === 'trigger') {
    // @ts-ignore
    return <div>{undefined.property}</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>🧪 E2E 에러 감지 테스트 페이지</CardTitle>
          <CardDescription>
            이 페이지는 E2E 테스트의 에러 감지 기능을 검증하기 위한 테스트 페이지입니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              ⚠️ 주의: 아래 버튼들은 의도적으로 에러를 발생시킵니다!
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">JavaScript 에러 테스트</h3>
            
            <Button 
              onClick={throwJavaScriptError}
              variant="destructive"
              data-testid="throw-js-error"
              className="w-full"
            >
              JavaScript Error 발생
            </Button>

            <Button 
              onClick={throwTypeError}
              variant="destructive"
              data-testid="throw-type-error"
              className="w-full"
            >
              TypeError 발생
            </Button>

            <Button 
              onClick={throwReferenceError}
              variant="destructive"
              data-testid="throw-reference-error"
              className="w-full"
            >
              ReferenceError 발생
            </Button>

            <Button 
              onClick={throwAsyncError}
              variant="destructive"
              data-testid="throw-async-error"
              className="w-full"
            >
              비동기 에러 발생
            </Button>

            <Button 
              onClick={causeReactError}
              variant="destructive"
              data-testid="throw-react-error"
              className="w-full"
            >
              React 렌더링 에러 발생
            </Button>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              💡 콘솔을 열면 이미 console.error가 출력된 것을 확인할 수 있습니다.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}