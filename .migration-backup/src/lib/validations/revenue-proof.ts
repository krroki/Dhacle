// revenue-proof.ts
// 수익인증 시스템 검증 스키마

import { z } from 'zod';

// 인증 작성 스키마
export const createProofSchema = z.object({
  title: z
    .string()
    .min(5, '제목은 최소 5자 이상 입력해주세요')
    .max(100, '제목은 100자를 초과할 수 없습니다')
    .regex(/^[가-힣a-zA-Z0-9\s!@#$%^&*(),.?":{}|<>]+$/, '특수문자는 일부만 허용됩니다'),

  amount: z
    .number()
    .min(0, '금액은 0원 이상이어야 합니다')
    .max(100000000, '1억원을 초과할 수 없습니다')
    .int('정수만 입력 가능합니다'),

  platform: z
    .enum(['youtube', 'instagram', 'tiktok'])
    .refine((val) => ['youtube', 'instagram', 'tiktok'].includes(val), {
      message: '플랫폼을 선택해주세요',
    }),

  screenshot: z
    .instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, '파일 크기는 5MB 이하여야 합니다')
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      'JPG, PNG, WebP 형식만 업로드 가능합니다'
    ),

  content: z
    .string()
    .min(50, '수익 달성 과정을 최소 50자 이상 작성해주세요')
    .max(10000, '내용은 10,000자를 초과할 수 없습니다'),

  signature: z
    .string()
    .min(1, '서명은 필수입니다')
    .regex(/^data:image\/(png|jpeg);base64,/, '올바른 서명 형식이 아닙니다'),
});

// 수정 스키마 (24시간 내만 가능)
export const updateProofSchema = z.object({
  title: z
    .string()
    .min(5, '제목은 최소 5자 이상 입력해주세요')
    .max(100, '제목은 100자를 초과할 수 없습니다')
    .optional(),

  content: z
    .string()
    .min(50, '수익 달성 과정을 최소 50자 이상 작성해주세요')
    .max(10000, '내용은 10,000자를 초과할 수 없습니다')
    .optional(),
});

// 댓글 스키마
export const commentSchema = z.object({
  content: z.string().min(1, '댓글을 입력해주세요').max(500, '댓글은 500자 이하로 작성해주세요'),
});

// 신고 스키마
export const reportSchema = z.object({
  reason: z.enum(['fake', 'spam', 'inappropriate', 'copyright', 'other']),
  details: z.string().max(500).optional(),
  acknowledged: z.boolean().refine((val) => val === true, '악용 시 제재 조치에 동의해야 합니다'),
});

// 타입 추출
export type CreateProofInput = z.infer<typeof createProofSchema>;
export type UpdateProofInput = z.infer<typeof updateProofSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
export type ReportInput = z.infer<typeof reportSchema>;
