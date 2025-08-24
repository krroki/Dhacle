/**
 * YouTube 이미지 최적화 유틸리티
 * 적절한 품질의 썸네일을 선택하여 성능 최적화
 */

export type ThumbnailQuality = 'default' | 'medium' | 'high' | 'standard' | 'maxres';

/**
 * YouTube 비디오 썸네일 URL 생성
 * @param videoId YouTube 비디오 ID
 * @param quality 썸네일 품질
 * @returns 최적화된 썸네일 URL
 */
export function getOptimizedYouTubeThumbnail(
  videoId: string,
  quality: ThumbnailQuality = 'high'
): string {
  const qualityMap: Record<ThumbnailQuality, string> = {
    default: 'default',        // 120x90 (가장 작음)
    medium: 'mqdefault',        // 320x180
    high: 'hqdefault',          // 480x360
    standard: 'sddefault',      // 640x480
    maxres: 'maxresdefault'     // 1280x720 (가장 큼)
  };
  
  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
}

/**
 * 뷰포트 크기에 따른 적응형 썸네일 품질 선택
 * @param width 뷰포트 너비
 * @returns 추천 썸네일 품질
 */
export function getAdaptiveThumbnailQuality(width: number): ThumbnailQuality {
  if (width <= 320) return 'default';
  if (width <= 640) return 'medium';
  if (width <= 1024) return 'high';
  if (width <= 1440) return 'standard';
  return 'maxres';
}

/**
 * YouTube 채널 아바타 URL 생성
 * @param channelId YouTube 채널 ID
 * @param size 아바타 크기 (88, 176, 800 등)
 * @returns 채널 아바타 URL
 */
export function getChannelAvatar(channelId: string, size: number = 88): string {
  // YouTube는 다양한 크기의 채널 아바타를 제공
  const validSizes = [88, 176, 800];
  const closestSize = validSizes.reduce((prev, curr) => 
    Math.abs(curr - size) < Math.abs(prev - size) ? curr : prev
  );
  
  return `https://yt3.ggpht.com/channel/${channelId}=s${closestSize}-c-k-c0x00ffffff-no-rj`;
}

/**
 * 썸네일 URL에서 비디오 ID 추출
 * @param thumbnailUrl YouTube 썸네일 URL
 * @returns 비디오 ID 또는 null
 */
export function extractVideoIdFromThumbnail(thumbnailUrl: string): string | null {
  const match = thumbnailUrl.match(/\/vi\/([a-zA-Z0-9_-]{11})\//);
  return match ? match[1] ?? null : null;
}

/**
 * 웹P 포맷 지원 여부 확인 (런타임)
 */
export function supportsWebP(): boolean {
  if (typeof window === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  return canvas.toDataURL('image/webp').indexOf('image/webp') === 0;
}

/**
 * 이미지 preload 링크 태그 생성
 * @param urls 프리로드할 이미지 URL 배열
 */
export function preloadImages(urls: string[]): void {
  if (typeof window === 'undefined') return;
  
  urls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  });
}

/**
 * Lazy loading을 위한 Intersection Observer 설정
 * @param selector 이미지 선택자
 * @param rootMargin 로딩 시작 거리
 */
export function setupLazyLoading(
  selector: string = 'img[data-src]',
  rootMargin: string = '50px'
): void {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;
  
  const images = document.querySelectorAll<HTMLImageElement>(selector);
  
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        const src = img.dataset.src;
        
        if (src) {
          img.src = src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      }
    });
  }, {
    rootMargin
  });
  
  images.forEach(img => imageObserver.observe(img));
}