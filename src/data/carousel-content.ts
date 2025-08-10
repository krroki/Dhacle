// Carousel Content Management System
// 간편하게 이미지와 YouTube 영상을 관리할 수 있습니다.

export interface CarouselSlide {
  id: number;
  type: 'image' | 'youtube';
  src?: string; // for image
  videoId?: string; // for youtube
  title: string;
  subtitle?: string;
  link: string;
  buttonText?: string;
}

export const carouselSlides: CarouselSlide[] = [
  {
    id: 1,
    type: 'image',
    src: '/images/banners/main-1.jpg',
    title: '유튜브로 월 1000만원',
    subtitle: '우리가 증명합니다',
    link: '/courses/youtube-masterclass',
    buttonText: '지금 시작하기'
  },
  {
    id: 2,
    type: 'youtube',
    videoId: 'dQw4w9WgXcQ', // YouTube ID만 입력
    title: '신규 회원 전용',
    subtitle: '첫 강의 90% 할인',
    link: '/promotion/new-member',
    buttonText: '할인 받기'
  },
  {
    id: 3,
    type: 'image',
    src: '/images/banners/main-2.jpg',
    title: '이번 주 HOT 강의',
    subtitle: '쇼츠 마스터 클래스',
    link: '/courses/shorts-master',
    buttonText: '강의 보기'
  },
  {
    id: 4,
    type: 'image',
    src: '/images/banners/main-3.jpg',
    title: 'AI 자막 생성기',
    subtitle: '작업 시간 90% 단축',
    link: '/tools/subtitle-generator',
    buttonText: '무료 체험'
  },
  {
    id: 5,
    type: 'youtube',
    videoId: 'M7lc1UVf-VE', // Another YouTube video
    title: '수익인증 대공개',
    subtitle: '월 3000만원 달성 비법',
    link: '/community/success-stories',
    buttonText: '성공 사례 보기'
  }
];

// YouTube 썸네일 URL 생성 헬퍼 함수
export function getYouTubeThumbnail(videoId: string, quality: 'max' | 'hq' | 'mq' | 'sd' = 'max'): string {
  const qualityMap = {
    max: 'maxresdefault',
    hq: 'hqdefault',
    mq: 'mqdefault',
    sd: 'sddefault'
  };
  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
}

// 슬라이드 데이터 가져오기
export function getSlideImage(slide: CarouselSlide): string {
  if (slide.type === 'youtube' && slide.videoId) {
    return getYouTubeThumbnail(slide.videoId);
  }
  return slide.src || '/images/placeholder.jpg';
}