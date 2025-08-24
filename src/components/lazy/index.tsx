import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';

/**
 * Lazy-loaded components for code splitting
 * These components are loaded only when needed to reduce initial bundle size
 */

// Heavy components that should be lazy-loaded
export const RichTextEditor = dynamic(
  () => import('@tiptap/react').then((mod) => mod.EditorProvider as ComponentType<any>),
  { 
    ssr: false,
    loading: () => <div className="h-64 bg-muted animate-pulse rounded-lg" />
  }
);

// YouTube Player - commented out until component is created
// export const YouTubePlayer = dynamic(
//   () => import('../features/youtube/YouTubePlayer').then((mod) => mod.YouTubePlayer),
//   { 
//     loading: () => <div className="aspect-video bg-muted animate-pulse rounded-lg" />
//   }
// );

// Image Crop Component
export const ImageCropModal = dynamic(
  () => import('react-image-crop').then((mod) => mod.default as ComponentType<any>),
  { 
    ssr: false,
    loading: () => <div className="h-96 bg-muted animate-pulse rounded-lg" />
  }
);

// Signature Canvas
export const SignatureCanvas = dynamic(
  () => import('react-signature-canvas').then((mod) => mod.default),
  { 
    ssr: false,
    loading: () => <div className="h-48 bg-muted animate-pulse rounded-lg" />
  }
);

// Confetti Effect
export const ConfettiEffect = dynamic(
  () => import('canvas-confetti').then((mod) => {
    // Create a component wrapper for the confetti function
    return function Confetti() {
      mod.default({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      return null;
    };
  }),
  { ssr: false }
);

// Heavy UI Components
export const VirtualizedList = dynamic(
  () => import('react-window').then((mod) => mod.FixedSizeList as ComponentType<any>),
  {
    ssr: false,
    loading: () => <div className="h-96 bg-muted animate-pulse rounded-lg" />
  }
);

export const InfiniteLoader = dynamic(
  () => import('react-window-infinite-loader').then((mod) => mod.default as ComponentType<any>),
  {
    ssr: false,
    loading: () => <div className="h-96 bg-muted animate-pulse rounded-lg" />
  }
);

// Masonry Layout
export const MasonryLayout = dynamic(
  () => import('masonic').then((mod) => mod.Masonry as ComponentType<any>),
  {
    ssr: false,
    loading: () => <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" />
  }
);

// Chart Components - commented out until component is created
// export const ChartComponent = dynamic(
//   () => import('../ui/chart').then((mod) => mod.default || mod.Chart),
//   {
//     ssr: false,
//     loading: () => <div className="h-64 bg-muted animate-pulse rounded-lg" />
//   }
// );

// Heavy Feature Components - commented out until components are created
// export const MetricsDashboard = dynamic(
//   () => import('../features/tools/youtube-lens/MetricsDashboard').then((mod) => mod.default || mod.MetricsDashboard),
//   {
//     loading: () => <div className="h-96 bg-muted animate-pulse rounded-lg" />
//   }
// );

// export const CommunityFeed = dynamic(
//   () => import('../features/community/CommunityFeed').then((mod) => mod.default || mod.CommunityFeed),
//   {
//     loading: () => <div className="space-y-4">
//       {[1, 2, 3].map(i => (
//         <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
//       ))}
//     </div>
//   }
// );

// Payment Components - commented out until component is created
// export const PaymentForm = dynamic(
//   () => import('../features/payment/PaymentForm').then((mod) => mod.default || mod.PaymentForm),
//   {
//     ssr: false,
//     loading: () => <div className="h-64 bg-muted animate-pulse rounded-lg" />
//   }
// );