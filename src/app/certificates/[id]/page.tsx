'use client';

import { Award, Download, Globe, Lock } from 'lucide-react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { usePublicCertificate, useUpdateCertificate, useGenerateCertificatePDF } from '@/hooks/queries/useCertificates';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';

export default function CertificatePage() {
  const params = useParams();
  const certificateId = params.id as string;
  const { user } = useAuth();
  const { data: certificate, isLoading } = usePublicCertificate(certificateId);
  const updateCertificate = useUpdateCertificate();
  const generatePDF = useGenerateCertificatePDF(certificate || null);
  const [isPublic, setIsPublic] = useState(certificate?.is_public || false);

  // Handle public toggle
  const handlePublicToggle = async (checked: boolean) => {
    if (!certificate || certificate.user_id !== user?.id) return;
    
    setIsPublic(checked);
    await updateCertificate.mutateAsync({
      id: certificate.id,
      is_public: checked
    });
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <Lock className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">수료증을 찾을 수 없습니다</h2>
            <p className="text-muted-foreground">
              이 수료증은 비공개이거나 존재하지 않습니다.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isOwner = user?.id === certificate.user_id;

  return (
    <div className="container max-w-4xl mx-auto p-6">
      <Card className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
        
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <CardTitle className="text-3xl flex items-center gap-3">
              <Award className="w-10 h-10 text-primary" />
              수료증
            </CardTitle>
            {isOwner && (
              <div className="flex items-center gap-2">
                <Label htmlFor="public-toggle" className="text-sm">
                  {isPublic ? <Globe className="w-4 h-4 inline mr-1" /> : <Lock className="w-4 h-4 inline mr-1" />}
                  {isPublic ? '공개' : '비공개'}
                </Label>
                <Switch
                  id="public-toggle"
                  checked={isPublic}
                  onCheckedChange={handlePublicToggle}
                  disabled={updateCertificate.isPending}
                />
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="relative space-y-6">
          {/* Certificate Number */}
          <div className="text-center py-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">증서 번호</p>
            <p className="text-lg font-mono font-semibold">{certificate.certificate_number}</p>
          </div>

          {/* User Info */}
          <div className="text-center space-y-2">
            <p className="text-lg">이 증서는</p>
            <p className="text-3xl font-bold text-primary">
              {certificate.user?.nickname || certificate.user?.username || '사용자'}
            </p>
            <p className="text-lg">님이</p>
          </div>

          {/* Course Info */}
          {certificate.course && (
            <div className="text-center space-y-2">
              <p className="text-lg">본 교육기관에서 실시한</p>
              <p className="text-2xl font-semibold">&ldquo;{certificate.course.title}&rdquo;</p>
              <p className="text-lg">과정을 성실히 이수하였기에</p>
              <p className="text-lg">이 증서를 수여합니다.</p>
            </div>
          )}

          {/* Completion Details */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">완료일</p>
              <p className="text-lg font-semibold">
                {new Date(certificate.completion_date).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">발급일</p>
              <p className="text-lg font-semibold">
                {new Date(certificate.issued_at).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>

          {/* Grade and Score */}
          {(certificate.grade || certificate.score) && (
            <div className="grid grid-cols-2 gap-4">
              {certificate.grade && (
                <div className="text-center p-4 bg-primary/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">등급</p>
                  <p className="text-2xl font-bold text-primary">{certificate.grade}</p>
                </div>
              )}
              {certificate.score && (
                <div className="text-center p-4 bg-primary/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">점수</p>
                  <p className="text-2xl font-bold text-primary">{certificate.score}점</p>
                </div>
              )}
            </div>
          )}

          {/* Organization */}
          <div className="text-center pt-8 border-t">
            <p className="text-2xl font-bold">Dhacle</p>
            <p className="text-sm text-muted-foreground">온라인 교육 플랫폼</p>
          </div>

          {/* Download Button */}
          <div className="flex justify-center pt-4">
            <Button
              size="lg"
              onClick={() => generatePDF.mutate()}
              disabled={generatePDF.isPending}
            >
              <Download className="w-4 h-4 mr-2" />
              수료증 다운로드
            </Button>
          </div>

          {/* Share Link */}
          {certificate.is_public && (
            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground">공유 링크</p>
              <div className="flex items-center gap-2 justify-center mt-2">
                <code className="px-2 py-1 bg-muted rounded text-sm">
                  {`${window.location.origin}/certificates/${certificate.id}`}
                </code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/certificates/${certificate.id}`);
                  }}
                >
                  복사
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}