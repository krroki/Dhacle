// Type definitions for YouTube creator tools site

export interface HeroSlide {
  id: string;
  type: 'image' | 'youtube';
  title: string;
  subtitle: string;
  mediaUrl: string; // Image URL or YouTube ID
  ctaText: string;
  ctaLink: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  status: 'live' | 'beta' | 'coming-soon' | 'planning';
  href: string;
}

// YouTube Creator Tools Site Data

export const dummyHeroSlides: HeroSlide[] = [
  {
    id: '1',
    type: 'image',
    title: 'YouTube 크리에이터 도구의 모든 것',
    subtitle: '데이터 분석부터 콘텐츠 제작까지 한 번에 해결',
    mediaUrl: '/images/carousel/carousel-01.jpg',
    ctaText: 'YouTube Lens 시작하기',
    ctaLink: '/tools/youtube-lens',
  },
  {
    id: '2',
    type: 'youtube',
    title: 'YouTube Lens 실전 활용법',
    subtitle: '채널 분석과 키워드 트렌드로 성장하는 법',
    mediaUrl: 'dQw4w9WgXcQ',
    ctaText: '도구 사용해보기',
    ctaLink: '/tools/youtube-lens',
  },
  {
    id: '3',
    type: 'image',
    title: '무료 특강: 수익화 전략',
    subtitle: 'YouTube 수익 최적화를 위한 핵심 전략',
    mediaUrl: '/images/carousel/carousel-03.jpg',
    ctaText: '수익 계산기 사용하기',
    ctaLink: '/tools/revenue-calculator',
  },
  {
    id: '4',
    type: 'youtube',
    title: '썸네일로 승부하라',
    subtitle: 'AI 기반 썸네일 분석으로 클릭률 10배 늘리기',
    mediaUrl: 'M7lc1UVf-VE',
    ctaText: '썸네일 제작 도구',
    ctaLink: '/tools/thumbnail-maker',
  },
];

export const dummyFAQs: FAQ[] = [
  {
    id: '1',
    question: 'YouTube Lens는 무료로 사용할 수 있나요?',
    answer: '기본 기능은 무료로 제공됩니다. API 키를 발급받아 더 많은 데이터에 접근할 수 있습니다.',
    category: '도구 사용',
  },
  {
    id: '2',
    question: 'API 키는 어떻게 발급받나요?',
    answer: '회원가입 후 설정 페이지에서 YouTube API 키를 발급받을 수 있습니다. 자세한 가이드를 제공합니다.',
    category: 'API 키',
  },
  {
    id: '3',
    question: '수익 계산기는 얼마나 정확한가요?',
    answer: 'YouTube 공식 데이터와 업계 평균 CPM을 기반으로 계산합니다. 실제 수익과 차이가 있을 수 있습니다.',
    category: '수익화',
  },
  {
    id: '4',
    question: '썸네일 제작 도구는 언제 출시되나요?',
    answer: '2024년 3월 출시 예정입니다. 베타 테스트 알림을 받고 싶다면 뉴스레터를 구독해주세요.',
    category: '출시 계획',
  },
  {
    id: '5',
    question: '데이터는 얼마나 자주 업데이트되나요?',
    answer: 'YouTube 채널 데이터는 하루 1-2회, 키워드 트렌드는 실시간으로 업데이트됩니다.',
    category: '데이터',
  },
  {
    id: '6',
    question: '여러 채널을 동시에 분석할 수 있나요?',
    answer: '네, YouTube Lens에서 즐겨찾기 기능을 통해 여러 채널을 저장하고 비교 분석할 수 있습니다.',
    category: '기능',
  },
  {
    id: '7',
    question: '모바일에서도 사용할 수 있나요?',
    answer: '네, 반응형 디자인으로 모바일과 태블릿에서도 최적화된 환경으로 이용할 수 있습니다.',
    category: '접근성',
  },
  {
    id: '8',
    question: '경쟁사 분석 기능이 있나요?',
    answer: '경쟁 채널의 업로드 패턴, 조회수 트렌드, 인기 콘텐츠 분석이 가능합니다.',
    category: '분석 기능',
  },
];

export const featuredTools: Tool[] = [
  {
    id: 'youtube-lens',
    name: 'YouTube Lens',
    description: '채널 분석, 키워드 트렌드, 경쟁사 분석을 한 번에',
    category: '분석',
    status: 'live',
    href: '/tools/youtube-lens',
  },
  {
    id: 'revenue-calculator',
    name: '수익 계산기',
    description: 'YouTube 수익 예측 및 CPM 분석',
    category: '수익화',
    status: 'beta',
    href: '/tools/revenue-calculator',
  },
  {
    id: 'thumbnail-maker',
    name: '썸네일 제작기',
    description: 'AI 기반 썸네일 분석 및 제작 도구',
    category: '콘텐츠',
    status: 'coming-soon',
    href: '/tools/thumbnail-maker',
  },
];