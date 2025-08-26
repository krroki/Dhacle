'use client'

import dynamic from 'next/dynamic'

// 무거운 컴포넌트들을 동적으로 임포트 예제
// 실제 컴포넌트가 존재할 때 주석을 해제하고 사용하세요

// // Editor 컴포넌트 (Tiptap)
// export const DynamicEditor = dynamic(
//   () => import('@/components/Editor').then(mod => mod.Editor),
//   {
//     loading: () => (
//       <div className="w-full h-[400px] animate-pulse bg-gray-100 rounded-lg" />
//     ),
//     ssr: false, // 클라이언트에서만 렌더링
//   }
// )

// // Chart 컴포넌트 (가상의 차트 컴포넌트)
// export const DynamicChart = dynamic(
//   () => import('@/components/Chart').then(mod => mod.default),
//   {
//     loading: () => <Skeleton className="w-full h-[300px]" />,
//     ssr: false,
//   }
// )

// // Modal 컴포넌트들
// export const DynamicVideoModal = dynamic(
//   () => import('@/components/modals/VideoModal').then(mod => mod.VideoModal),
//   {
//     loading: () => null,
//     ssr: false,
//   }
// )

// export const DynamicPaymentModal = dynamic(
//   () => import('@/components/modals/PaymentModal').then(mod => mod.PaymentModal),
//   {
//     loading: () => null,
//     ssr: false,
//   }
// )

// 무거운 라이브러리를 사용하는 컴포넌트 (예제)
// 실제 라이브러리가 설치되어 있을 때 주석을 해제하세요
// export const DynamicImageCropper = dynamic(
//   () => import('react-image-crop'),
//   {
//     loading: () => <Skeleton className="w-full h-[400px]" />,
//     ssr: false,
//   }
// )

// Canvas를 사용하는 컴포넌트
export const DynamicSignaturePad = dynamic(
  () => import('react-signature-canvas'),
  {
    loading: () => (
      <div className="w-full h-[200px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
        <span className="text-gray-400">서명 패드 로딩 중...</span>
      </div>
    ),
    ssr: false,
  }
)

// 조건부 동적 임포트 예제
interface ConditionalComponentProps {
  type: 'signature'
  props?: Record<string, unknown>
}

export function ConditionalDynamicComponent({ type, props }: ConditionalComponentProps) {
  switch (type) {
    case 'signature':
      return <DynamicSignaturePad {...props} />
    default:
      return null
  }
}