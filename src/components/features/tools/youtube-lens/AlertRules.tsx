'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AlertRules() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>알림 규칙</CardTitle>
      </CardHeader>
      <CardContent className="py-12">
        <div className="text-center text-muted-foreground">
          <p>알림 규칙 기능은 준비 중입니다.</p>
          <p className="text-sm mt-2">빠른 시일 내에 제공될 예정입니다.</p>
        </div>
      </CardContent>
    </Card>
  );
}

// TODO: alertRules 테이블 생성 후 원래 기능 복원
// 원본 코드는 AlertRules.tsx.backup 파일 참조