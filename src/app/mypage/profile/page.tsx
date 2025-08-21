'use client';

import {
  AlertCircle,
  Calendar,
  Check,
  ExternalLink,
  Info,
  Link2,
  Loader2,
  Mail,
  Shield,
  User,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createBrowserClient } from '@/lib/supabase/browser-client';
import {
  DINOHIGHCLASS_CAFE,
  getDisplayNickname,
  getNicknameType,
  isValidNaverCafeUrl,
} from '@/lib/utils/nickname-generator';

interface Profile {
  id: string;
  username: string | null;
  email: string | null;
  avatar_url: string | null;
  randomNickname: string | null;
  naverCafeNickname: string | null;
  naverCafeVerified: boolean;
  naverCafeMemberUrl: string | null;
  naverCafeVerifiedAt: string | null;
  created_at: string;
  updated_at: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cafeNickname, setCafeNickname] = useState('');
  const [cafeMemberUrl, setCafeMemberUrl] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<
    'idle' | 'pending' | 'success' | 'error'
  >('idle');
  const [error_message, setErrorMessage] = useState('');
  const router = useRouter();
  const supabase = createBrowserClient();

  const fetchProfile = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        throw error;
      }

      setProfile(data);
      // TODO: 네이버 카페 관련 필드는 profiles 테이블에 추가 필요
      // if (data.naver_cafe_nickname) {
      //   setCafeNickname(data.naver_cafe_nickname);
      // }
      // if (data.naver_cafe_member_url) {
      //   setCafeMemberUrl(data.naver_cafe_member_url);
      // }
    } catch (_error) {
    } finally {
      setLoading(false);
    }
  }, [router, supabase]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleNaverCafeVerification = async () => {
    if (!cafeNickname.trim()) {
      setErrorMessage('네이버 카페 닉네임을 입력해주세요');
      return;
    }

    if (!cafeMemberUrl.trim()) {
      setErrorMessage('네이버 카페 프로필 URL을 입력해주세요');
      return;
    }

    if (!isValidNaverCafeUrl(cafeMemberUrl)) {
      setErrorMessage(`올바른 ${DINOHIGHCLASS_CAFE.name} 카페 URL을 입력해주세요`);
      return;
    }

    setVerificationStatus('pending');
    setSaving(true);
    setErrorMessage('');

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not found');
      }

      // 인증 요청 생성
      const { data: verification, error: verificationError } = await supabase
        .from('naver_cafe_verifications')
        .insert({
          user_id: user.id,
          
          cafe_nickname: cafeNickname,
          cafe_member_url: cafeMemberUrl,
          verification_status: 'pending',
        })
        .select()
        .single();

      if (verificationError) {
        throw verificationError;
      }

      // 임시로 자동 승인 (실제로는 관리자가 수동 검증)
      // TODO: 관리자 검증 시스템 구현
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          // TODO: profiles 테이블에 네이버 카페 관련 필드 추가 필요
          // naver_cafe_nickname: cafeNickname,
          // naver_cafe_nickname: cafeNickname,
          cafe_member_url: cafeMemberUrl,
          // naver_cafe_verified: true,
          // naver_cafe_verified_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      // 검증 상태 업데이트
      await supabase
        .from('naver_cafe_verifications')
        .update({
          verification_status: 'verified',
          verifiedAt: new Date().toISOString(),
        })
        .eq('id', verification.id);

      setVerificationStatus('success');
      await fetchProfile();
    } catch (_error) {
      setErrorMessage('네이버 카페 연동 중 오류가 발생했습니다');
      setVerificationStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveNaverCafe = async () => {
    if (!confirm('네이버 카페 연동을 해제하시겠습니까? 랜덤 닉네임으로 변경됩니다.')) {
      return;
    }

    setSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not found');
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          // naverCafeVerified: false,
          // naverCafeVerifiedAt: null,
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      setVerificationStatus('idle');
      await fetchProfile();
    } catch (_error) {
      setErrorMessage('네이버 카페 연동 해제 중 오류가 발생했습니다');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!profile) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>프로필을 불러올 수 없습니다.</AlertDescription>
      </Alert>
    );
  }

  const displayNickname = getDisplayNickname(profile);
  const nicknameType = getNicknameType(profile);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">프로필 관리</h2>
        <p className="mt-1 text-gray-600">프로필 정보와 닉네임 설정을 관리하세요</p>
      </div>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList>
          <TabsTrigger value="basic">기본 정보</TabsTrigger>
          <TabsTrigger value="nickname">닉네임 설정</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          {/* 기본 정보 */}
          <Card>
            <CardHeader>
              <CardTitle>기본 정보</CardTitle>
              <CardDescription>가입 시 등록된 기본 정보입니다</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center">
                  <User className="h-10 w-10 text-purple-600" />
                </div>
                <div>
                  <p className="text-lg font-semibold">{displayNickname}</p>
                  <Badge variant={nicknameType === 'naver' ? 'default' : 'secondary'}>
                    {nicknameType === 'naver' ? '네이버 카페 닉네임' : '랜덤 닉네임'}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    이메일
                  </Label>
                  <p className="text-sm text-gray-900">{profile.email || '미등록'}</p>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    가입일
                  </Label>
                  <p className="text-sm text-gray-900">
                    {new Date(profile.created_at).toLocaleDateString('ko-KR')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nickname" className="space-y-6">
          {/* 현재 닉네임 정보 */}
          <Card>
            <CardHeader>
              <CardTitle>현재 닉네임</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">표시 닉네임</span>
                    <span className="font-semibold text-lg">{displayNickname}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">닉네임 유형</span>
                    <Badge variant={nicknameType === 'naver' ? 'default' : 'secondary'}>
                      {nicknameType === 'naver' ? '네이버 카페' : '랜덤 생성'}
                    </Badge>
                  </div>
                </div>

                {profile.randomNickname && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      랜덤 닉네임은 변경할 수 없습니다. 네이버 카페 연동 시 카페 닉네임이 우선
                      표시됩니다.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 디지털 노마드 하이클래스 카페 연동 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                디지털 노마드 하이클래스 카페 연동
              </CardTitle>
              <CardDescription>
                &apos;{DINOHIGHCLASS_CAFE.name}&apos; 카페 회원 인증 시 카페 닉네임을 사용할 수
                있습니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              {profile.naverCafeVerified ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Check className="h-5 w-5 text-green-600" />
                      <span className="font-semibold text-green-900">
                        {DINOHIGHCLASS_CAFE.name} 카페 연동 완료
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">카페 닉네임</span>
                        <span className="font-medium">{profile.naverCafeNickname}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">인증일</span>
                        <span className="font-medium">
                          {profile.naverCafeVerifiedAt
                            ? new Date(profile.naverCafeVerifiedAt).toLocaleDateString('ko-KR')
                            : '-'}
                        </span>
                      </div>
                      {profile.naverCafeMemberUrl && (
                        <div className="pt-2">
                          <a
                            href={profile.naverCafeMemberUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700"
                          >
                            카페 프로필 보기
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={handleRemoveNaverCafe}
                    variant="outline"
                    className="w-full"
                    disabled={saving}
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <X className="h-4 w-4 mr-2" />
                    )}
                    연동 해제
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      <strong>{DINOHIGHCLASS_CAFE.name}</strong> 카페 회원만 연동 가능합니다.
                      <br />
                      카페 가입 후 닉네임과 프로필 URL을 입력해주세요.
                      <br />
                      <a
                        href={DINOHIGHCLASS_CAFE.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 underline mt-1 inline-block"
                      >
                        카페 바로가기 →
                      </a>
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>카페 닉네임</Label>
                      <Input
                        placeholder="디지털 노마드 하이클래스 카페에서 사용하는 닉네임"
                        value={cafeNickname}
                        onChange={(e) => setCafeNickname(e.target.value)}
                        disabled={saving}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>카페 프로필 URL</Label>
                      <Input
                        placeholder={`${DINOHIGHCLASS_CAFE.url}/member/...`}
                        value={cafeMemberUrl}
                        onChange={(e) => setCafeMemberUrl(e.target.value)}
                        disabled={saving}
                      />
                      <p className="text-xs text-gray-500">
                        {DINOHIGHCLASS_CAFE.name} 카페 → 내 활동 → 프로필에서 URL을 복사해주세요
                      </p>
                    </div>

                    {error_message && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error_message}</AlertDescription>
                      </Alert>
                    )}

                    {verificationStatus === 'success' && (
                      <Alert>
                        <Check className="h-4 w-4" />
                        <AlertDescription>네이버 카페 연동이 완료되었습니다!</AlertDescription>
                      </Alert>
                    )}

                    <Button
                      onClick={handleNaverCafeVerification}
                      className="w-full"
                      disabled={saving || !cafeNickname || !cafeMemberUrl}
                    >
                      {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Link2 className="h-4 w-4 mr-2" />
                      )}
                      카페 연동하기
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
