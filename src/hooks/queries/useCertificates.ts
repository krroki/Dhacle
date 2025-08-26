/**
 * React Query hooks for user certificates
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPatch, apiPost } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import type { UserCertificate } from '@/types';
import { toast } from '@/hooks/use-toast';

/**
 * Hook to fetch user's certificates
 */
export function useCertificates() {
  return useQuery({
    queryKey: queryKeys.certificates.list(),
    queryFn: async () => {
      const response = await apiGet<{ data: UserCertificate[] }>(
        '/api/certificates'
      );
      return response.data || [];
    },
  });
}

/**
 * Hook to fetch a specific certificate by ID
 */
export function useCertificate(certificateId: string | null) {
  return useQuery({
    queryKey: queryKeys.certificates.detail(certificateId!),
    queryFn: async () => {
      if (!certificateId) return null;
      const response = await apiGet<{ data: UserCertificate }>(
        `/api/certificates?id=${certificateId}`
      );
      return response.data;
    },
    enabled: !!certificateId,
  });
}

/**
 * Hook to fetch certificate for a specific course
 */
export function useCourseCertificate(courseId: string | null) {
  return useQuery({
    queryKey: queryKeys.certificates.byCourse(courseId!),
    queryFn: async () => {
      if (!courseId) return null;
      const response = await apiGet<{ data: UserCertificate | null }>(
        `/api/certificates?courseId=${courseId}`
      );
      return response.data;
    },
    enabled: !!courseId,
  });
}

/**
 * Hook to fetch public certificate details
 */
export function usePublicCertificate(certificateId: string | null) {
  return useQuery({
    queryKey: queryKeys.certificates.public(certificateId!),
    queryFn: async () => {
      if (!certificateId) return null;
      const response = await apiGet<{ 
        data: UserCertificate & {
          user?: {
            id: string;
            username: string;
            nickname: string;
            profile_image_url?: string;
          };
          course?: {
            id: string;
            title: string;
            description?: string;
            instructor_name?: string;
            thumbnail_url?: string;
          };
        }
      }>(`/api/certificates/${certificateId}`);
      return response.data;
    },
    enabled: !!certificateId,
  });
}

/**
 * Hook to create a certificate
 */
export function useCreateCertificate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      course_id: string;
      completion_date: string;
      grade?: string;
      score?: number;
    }) => {
      const response = await apiPost<{ data: UserCertificate }>(
        '/api/certificates',
        data
      );
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.certificates.list() 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.certificates.byCourse(data.course_id) 
      });
      
      toast({
        title: '수료증 발급 완료',
        description: '축하합니다! 수료증이 성공적으로 발급되었습니다.',
      });
    },
    onError: (error: Error) => {
      const message = (error as any).response?.data?.error || '수료증 발급에 실패했습니다.';
      toast({
        title: '오류',
        description: message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to update certificate (make public/private, update URL)
 */
export function useUpdateCertificate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      id: string;
      is_public?: boolean;
      certificate_url?: string;
    }) => {
      const response = await apiPatch<{ data: UserCertificate }>(
        '/api/certificates',
        data
      );
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate and update related queries
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.certificates.list() 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.certificates.detail(data.id) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.certificates.public(data.id) 
      });
      
      toast({
        title: '수료증 업데이트 완료',
        description: '수료증 정보가 성공적으로 업데이트되었습니다.',
      });
    },
    onError: (error: Error) => {
      const message = (error as any).response?.data?.error || '수료증 업데이트에 실패했습니다.';
      toast({
        title: '오류',
        description: message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to generate certificate PDF
 */
export function useGenerateCertificatePDF(certificate: UserCertificate | null) {
  return useMutation({
    mutationFn: async () => {
      if (!certificate) throw new Error('Certificate not found');
      
      // This would typically call a PDF generation service
      // For now, we'll create a simple download
      const certificateData = {
        certificateNumber: certificate.certificate_number,
        userName: 'User Name', // This should come from user context
        courseName: 'Course Name', // This should come from course data
        completionDate: new Date(certificate.completion_date).toLocaleDateString('ko-KR'),
        grade: certificate.grade,
        score: certificate.score,
      };

      // Create a simple text certificate (in production, use PDF library)
      const content = `
========================================
            수 료 증
========================================

증서번호: ${certificateData.certificateNumber}

이름: ${certificateData.userName}

위 사람은 본 교육기관에서 실시한
"${certificateData.courseName}" 과정을
성실히 이수하였기에 이 증서를 수여합니다.

완료일: ${certificateData.completionDate}
${certificateData.grade ? `등급: ${certificateData.grade}` : ''}
${certificateData.score ? `점수: ${certificateData.score}점` : ''}

========================================
              Dhacle
========================================
      `;

      // Create download
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate_${certificate.certificate_number}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return certificateData;
    },
    onSuccess: () => {
      toast({
        title: '수료증 다운로드 완료',
        description: '수료증이 다운로드되었습니다.',
      });
    },
    onError: () => {
      toast({
        title: '오류',
        description: '수료증 다운로드에 실패했습니다.',
        variant: 'destructive',
      });
    },
  });
}