// 강의 상세 페이지용 심플한 타입 정의 (평점/수강생수 제거)

export interface SimpleCourse {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  price: number;
  originalPrice?: number;
  discountRate?: number;
  thumbnailUrl: string;
  duration: string;
  includedItems: string[];

  // 콘텐츠 블록 시스템
  contentBlocks: ContentBlock[];

  // 탭 콘텐츠
  curriculum: CurriculumWeek[];
  faqs: FAQ[];

  // 기타 정보
  instructorName?: string;
  isPremium: boolean;
  status: 'active' | 'inactive' | 'coming_soon';
  launchDate?: string;
  created_at: string;
  updated_at: string;
}

export interface ContentBlock {
  id: string;
  type:
    | 'heading'
    | 'text'
    | 'image'
    | 'gif'
    | 'video'
    | 'divider'
    | 'grid'
    | 'accordion'
    | 'button'
    | 'html';
  content?: string;
  url?: string;
  alt?: string;
  columns?: ContentBlock[][];
  items?: AccordionItem[];
}

export interface AccordionItem {
  id: string;
  title: string;
  content: string;
}

export interface CurriculumWeek {
  week: number;
  title: string;
  description?: string;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  isFree?: boolean;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

// Mock 데이터 생성 함수
export const getMockSimpleCourse = (id: string): SimpleCourse => ({
  id,
  title: '유튜브 쇼츠 마스터 과정',
  subtitle: '8주 완성 실전 커리큘럼',
  description:
    '초보자부터 전문가까지, 체계적인 커리큘럼으로 유튜브 쇼츠 크리에이터가 되는 완벽한 과정입니다.',
  price: 99000,
  originalPrice: 199000,
  discountRate: 50,
  thumbnailUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1200',
  duration: '평생 시청 가능',
  includedItems: [
    '8주 완성 커리큘럼',
    '실습 프로젝트 자료',
    '1:1 피드백 제공',
    '평생 업데이트',
    '수료증 발급',
    '커뮤니티 접근 권한',
  ],

  contentBlocks: [
    {
      id: 'img-1',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1626544827763-d516dce335e2?w=1400',
      alt: '강의 소개 이미지',
    },
    {
      id: 'head-1',
      type: 'heading',
      content: '🎯 이런 분들께 추천해요',
    },
    {
      id: 'text-1',
      type: 'text',
      content:
        '유튜브 쇼츠를 시작하고 싶지만 어떻게 해야 할지 막막한 분들, 이미 시작했지만 조회수가 늘지 않아 고민인 분들, 체계적인 커리큘럼으로 제대로 배우고 싶은 분들을 위한 과정입니다.',
    },
    {
      id: 'img-2',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1611162616305-c69b3037c2e0?w=1400',
      alt: '강의 커리큘럼',
    },
    {
      id: 'head-2',
      type: 'heading',
      content: '📚 무엇을 배우나요?',
    },
    {
      id: 'text-2',
      type: 'text',
      content:
        '유튜브 쇼츠의 알고리즘 이해부터 시작하여, 바이럴 콘텐츠 기획법, 촬영 및 편집 기술, 썸네일 제작, 업로드 최적화, 데이터 분석까지 A to Z를 다룹니다.',
    },
    {
      id: 'video-1',
      type: 'video',
      url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      content: '미리보기 영상',
    },
    {
      id: 'img-3',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=1400',
      alt: '수강생 성과',
    },
    {
      id: 'head-3',
      type: 'heading',
      content: '💡 강의 특징',
    },
    {
      id: 'accordion-1',
      type: 'accordion',
      items: [
        {
          id: 'acc-1',
          title: '실전 중심 커리큘럼',
          content: '이론만 배우는 것이 아닌, 매주 실제 쇼츠를 제작하며 실력을 쌓습니다.',
        },
        {
          id: 'acc-2',
          title: '1:1 맞춤형 피드백',
          content: '제출한 과제에 대해 강사가 직접 상세한 피드백을 제공합니다.',
        },
        {
          id: 'acc-3',
          title: '평생 업데이트',
          content: '한 번 수강하면 평생 업데이트되는 콘텐츠를 무료로 이용할 수 있습니다.',
        },
      ],
    },
  ],

  curriculum: [
    {
      week: 1,
      title: '유튜브 쇼츠의 이해',
      description: '쇼츠 알고리즘과 성공 전략',
      lessons: [
        { id: 'l1-1', title: '쇼츠 vs 일반 영상의 차이점', duration: '15:00' },
        { id: 'l1-2', title: '알고리즘 완벽 이해', duration: '20:00' },
        { id: 'l1-3', title: '성공 사례 분석', duration: '25:00' },
      ],
    },
    {
      week: 2,
      title: '콘텐츠 기획',
      description: '바이럴 콘텐츠 만들기',
      lessons: [
        { id: 'l2-1', title: '트렌드 분석 방법', duration: '18:00' },
        { id: 'l2-2', title: '스토리텔링 기법', duration: '22:00' },
        { id: 'l2-3', title: '훅 만들기', duration: '15:00' },
      ],
    },
    {
      week: 3,
      title: '촬영 기법',
      description: '스마트폰으로 전문가처럼',
      lessons: [
        { id: 'l3-1', title: '촬영 장비와 세팅', duration: '20:00' },
        { id: 'l3-2', title: '구도와 앵글', duration: '18:00' },
        { id: 'l3-3', title: '조명 활용법', duration: '15:00' },
      ],
    },
  ],

  faqs: [
    {
      id: 'faq-1',
      question: '강의는 언제까지 들을 수 있나요?',
      answer:
        '한 번 구매하시면 평생 시청 가능합니다. 업데이트되는 콘텐츠도 추가 비용 없이 이용하실 수 있습니다.',
    },
    {
      id: 'faq-2',
      question: '환불은 가능한가요?',
      answer: '구매 후 7일 이내, 전체 강의의 10% 미만 수강 시 100% 환불 가능합니다.',
    },
    {
      id: 'faq-3',
      question: '수료증은 발급되나요?',
      answer: '전체 강의의 80% 이상 수강 시 수료증이 자동 발급됩니다.',
    },
  ],

  instructorName: '김철수',
  isPremium: true,
  status: 'active',
  launchDate: '2025-02-01',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});
