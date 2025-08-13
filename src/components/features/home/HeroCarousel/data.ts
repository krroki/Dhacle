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
    type: 'youtube',
    src: 'fj_AsijzIhM', 
    alt: 'YouTube Shorts 마스터 클래스 소개',
    link: '/courses/youtube-shorts-master'
  },
  {
    id: '2',
    type: 'image',
    src: '/images/carousel/carousel-01.jpg',
    alt: '2025년 새해 특별 할인 이벤트',
    link: '/events/new-year-2025'
  },
  {
    id: '3',
    type: 'youtube',
    src: 'RxhBub7IQRg', 
    alt: '디하클 커뮤니티 소개',
    link: '/community'
  },
  {
    id: '4',
    type: 'image',
    src: '/images/carousel/carousel-02.jpg',
    alt: '무료 강의 오픈',
    link: '/courses/free'
  },
  {
    id: '5',
    type: 'youtube',
    src: 'M_7tBvpVPo0', 
    alt: '크리에이터 성공 스토리',
    link: '/success-stories'
  },
  {
    id: '6',
    type: 'image',
    src: '/images/carousel/carousel-03.jpg',
    alt: '실시간 라이브 세미나',
    link: '/live-seminar'
  }
];

// YouTube 썸네일 URL 헬퍼 함수
export const getYouTubeThumbnail = (videoId: string, quality: 'max' | 'high' | 'medium' | 'default' = 'high') => {
  const qualityMap = {
    max: 'maxresdefault',
    high: 'hqdefault',
    medium: 'mqdefault',
    default: 'sddefault'
  };
  
  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
};

// 이미지 프리로드 헬퍼 함수
export const preloadImages = (items: CarouselItem[]) => {
  if (typeof window === 'undefined') return;
  
  items.forEach(item => {
    const img = new Image();
    if (item.type === 'youtube') {
      img.src = getYouTubeThumbnail(item.src);
    } else {
      img.src = item.src;
    }
  });
};