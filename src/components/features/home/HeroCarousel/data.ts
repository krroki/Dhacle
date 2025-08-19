// 실제 YouTube 비디오 ID와 이미지를 사용한 캐러셀 데이터
export interface CarouselItem {
  id: string;
  type: 'youtube' | 'image';
  src: string;
  alt: string;
  link: string;
}

export const carouselItems: CarouselItem[] = [
  {
    id: '1',
    type: 'image',
    src: '/images/carousel/1.png',
    alt: 'YouTube Shorts 크리에이터 교육 플랫폼',
    link: '/courses',
  },
  {
    id: '2',
    type: 'image',
    src: '/images/carousel/2.png',
    alt: '디하클 특별 프로모션',
    link: '/courses/free',
  },
  {
    id: '3',
    type: 'image',
    src: '/images/carousel/3.png',
    alt: '크리에이터 성공 스토리',
    link: '/community/success',
  },
  {
    id: '4',
    type: 'image',
    src: '/images/carousel/4.png',
    alt: '무료 강의 오픈',
    link: '/courses/free',
  },
  {
    id: '5',
    type: 'image',
    src: '/images/carousel/5.png',
    alt: '디하클 커뮤니티',
    link: '/community',
  },
  {
    id: '6',
    type: 'image',
    src: '/images/carousel/6.png',
    alt: '실시간 수익 인증',
    link: '/revenue-proof',
  },
];

// YouTube 썸네일 URL 헬퍼 함수
export const getYouTubeThumbnail = (
  videoId: string,
  quality: 'max' | 'high' | 'medium' | 'default' = 'high'
) => {
  const qualityMap = {
    max: 'maxresdefault',
    high: 'hqdefault',
    medium: 'mqdefault',
    default: 'sddefault',
  };

  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
};

// 이미지 프리로드 헬퍼 함수
export const preloadImages = (items: CarouselItem[]) => {
  if (typeof window === 'undefined') return;

  items.forEach((item) => {
    const img = new Image();
    if (item.type === 'youtube') {
      img.src = getYouTubeThumbnail(item.src);
    } else {
      img.src = item.src;
    }
  });
};
