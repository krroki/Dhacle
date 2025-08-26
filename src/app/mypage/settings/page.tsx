'use client';

import { AlertCircle, Bell, Eye, Loader2, LogOut, Shield, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createBrowserClient } from '@/lib/supabase/browser-client';

export default function SettingsPage() {
  const [loading, set_loading] = useState(false);
  const [message, set_message] = useState('');
  const router = useRouter();
  const supabase = createBrowserClient();

  const handle_logout = async () => {
    set_loading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }

      router.push('/');
    } catch (error) {
      console.error('Page error:', error);
      set_message('로그아웃 중 오류가 발생했습니다');
    } finally {
      set_loading(false);
    }
  };

  const handle_delete_account = async () => {
    if (!confirm('정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    if (!confirm('계정 삭제 시 모든 데이터가 영구적으로 삭제됩니다. 계속하시겠습니까?')) {
      return;
    }

    set_loading(true);
    try {
      // TODO: 계정 삭제 API 구현
      set_message('계정 삭제 기능은 준비 중입니다. 고객센터로 문의해주세요.');
    } catch (error) {
      console.error('Page error:', error);
      set_message('계정 삭제 중 오류가 발생했습니다');
    } finally {
      set_loading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">계정 설정</h2>
        <p className="mt-1 text-gray-600">계정 보안과 개인정보를 관리하세요</p>
      </div>

      {message && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {/* 보안 설정 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            보안 설정
          </CardTitle>
          <CardDescription>계정 보안을 강화하세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <p className="font-medium">비밀번호 변경</p>
              <p className="text-sm text-gray-600">계정 비밀번호를 변경합니다</p>
            </div>
            <Button variant="outline" disabled={true}>
              준비 중
            </Button>
          </div>

          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <p className="font-medium">2단계 인증</p>
              <p className="text-sm text-gray-600">추가 보안 레이어를 설정합니다</p>
            </div>
            <Button variant="outline" disabled={true}>
              준비 중
            </Button>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium">로그인 기록</p>
              <p className="text-sm text-gray-600">최근 로그인 활동을 확인합니다</p>
            </div>
            <Button variant="outline" disabled={true}>
              준비 중
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 알림 설정 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            알림 설정
          </CardTitle>
          <CardDescription>알림 수신 방법을 설정하세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <p className="font-medium">이메일 알림</p>
              <p className="text-sm text-gray-600">중요한 업데이트를 이메일로 받습니다</p>
            </div>
            <Button variant="outline" disabled={true}>
              준비 중
            </Button>
          </div>

          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <p className="font-medium">강의 알림</p>
              <p className="text-sm text-gray-600">새 강의 및 업데이트 알림</p>
            </div>
            <Button variant="outline" disabled={true}>
              준비 중
            </Button>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium">커뮤니티 알림</p>
              <p className="text-sm text-gray-600">댓글 및 좋아요 알림</p>
            </div>
            <Button variant="outline" disabled={true}>
              준비 중
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 개인정보 설정 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            개인정보 설정
          </CardTitle>
          <CardDescription>개인정보 공개 범위를 설정하세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <p className="font-medium">프로필 공개</p>
              <p className="text-sm text-gray-600">다른 사용자에게 프로필 공개</p>
            </div>
            <Button variant="outline" disabled={true}>
              준비 중
            </Button>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium">활동 내역 공개</p>
              <p className="text-sm text-gray-600">학습 활동 공개 범위 설정</p>
            </div>
            <Button variant="outline" disabled={true}>
              준비 중
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 계정 관리 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">위험 구역</CardTitle>
          <CardDescription>이 작업들은 되돌릴 수 없습니다</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <p className="font-medium">로그아웃</p>
              <p className="text-sm text-gray-600">현재 기기에서 로그아웃합니다</p>
            </div>
            <Button variant="outline" onClick={handle_logout} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <LogOut className="h-4 w-4 mr-2" />
                  로그아웃
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-red-600">계정 삭제</p>
              <p className="text-sm text-gray-600">계정과 모든 데이터를 영구 삭제합니다</p>
            </div>
            <Button variant="destructive" onClick={handle_delete_account} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  계정 삭제
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
