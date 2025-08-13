// Type definitions for home page data

export interface HeroSlide {
  id: string;
  type: 'image' | 'youtube';
  title: string;
  subtitle: string;
  mediaUrl: string; // Image URL or YouTube ID
  ctaText: string;
  ctaLink: string;
}

export interface Instructor {
  id: string;
  name: string;
  profileImage: string;
  specialty: string;
  courseCount: number;
}

export interface RevenueProof {
  id: string;
  userName: string;
  userAvatar: string;
  amount: number;
  date: string;
  platform: 'youtube' | 'instagram' | 'tiktok';
  verified: boolean;
}

export interface Course {
  id: string;
  title: string;
  instructor: string;
  thumbnail: string;
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  isFree: boolean;
  price?: number;
  enrollCount: number;
}

export interface CourseSchedule {
  id: string;
  courseId: string;
  courseName: string;
  instructor: string;
  date: string;
  time: string;
  isLive: boolean;
  registeredCount: number;
  maxCapacity: number;
}

export interface Ebook {
  id: string;
  title: string;
  author: string;
  cover: string;
  description: string;
  isFree: boolean;
  price?: number;
  downloadCount: number;
  fileSize: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

// Dummy Data

export const dummyHeroSlides: HeroSlide[] = [
  {
    id: '1',
    type: 'image',
    title: '크리에이터의 꿈을 현실로',
    subtitle: 'YouTube Shorts로 시작하는 새로운 커리어',
    mediaUrl: '/images/carousel/carousel-01.jpg',
    ctaText: '무료로 시작하기',
    ctaLink: '/auth/signup'
  },
  {
    id: '2',
    type: 'youtube',
    title: '실제 수익 인증 확인',
    subtitle: '투명한 수익 공개로 신뢰를 쌓습니다',
    mediaUrl: 'dQw4w9WgXcQ',
    ctaText: '수익인증 보기',
    ctaLink: '/revenue-gallery'
  },
  {
    id: '3',
    type: 'image',
    title: '신년 특별 할인',
    subtitle: '최대 50% 할인 혜택을 놓치지 마세요',
    mediaUrl: '/images/carousel/carousel-03.jpg',
    ctaText: '할인 혜택 받기',
    ctaLink: '/promotion'
  },
  {
    id: '4',
    type: 'youtube',
    title: '바이럴 콘텐츠의 비밀',
    subtitle: '100만 뷰 달성 노하우 공개',
    mediaUrl: 'M7lc1UVf-VE',
    ctaText: '강의 보러가기',
    ctaLink: '/courses/viral-content'
  }
];

export const dummyInstructors: Instructor[] = [
  {
    id: '1',
    name: '김강사',
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kim',
    specialty: '콘텐츠 기획',
    courseCount: 5
  },
  {
    id: '2',
    name: '이멘토',
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lee',
    specialty: '영상 편집',
    courseCount: 8
  },
  {
    id: '3',
    name: '박코치',
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=park',
    specialty: '채널 성장',
    courseCount: 3
  },
  {
    id: '4',
    name: '최전문가',
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=choi',
    specialty: '알고리즘 분석',
    courseCount: 7
  },
  {
    id: '5',
    name: '정크리에이터',
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jung',
    specialty: '트렌드 분석',
    courseCount: 4
  },
  {
    id: '6',
    name: '강마스터',
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kang',
    specialty: '수익화 전략',
    courseCount: 6
  },
  {
    id: '7',
    name: '윤샘',
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=yoon',
    specialty: '브랜딩',
    courseCount: 5
  },
  {
    id: '8',
    name: '장튜터',
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jang',
    specialty: '스토리텔링',
    courseCount: 9
  },
  {
    id: '9',
    name: '임코치',
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lim',
    specialty: '라이브 방송',
    courseCount: 4
  },
  {
    id: '10',
    name: '한멘토',
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=han',
    specialty: '커뮤니티 관리',
    courseCount: 3
  },
  {
    id: '11',
    name: '오선생',
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=oh',
    specialty: '협업 전략',
    courseCount: 5
  },
  {
    id: '12',
    name: '서마스터',
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=seo',
    specialty: 'SEO 최적화',
    courseCount: 7
  }
];

export const dummyRevenueProofs: RevenueProof[] = [
  {
    id: '1',
    userName: '김유튜버',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1',
    amount: 15000000,
    date: '2025-01-01',
    platform: 'youtube',
    verified: true
  },
  {
    id: '2',
    userName: '이쇼츠',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user2',
    amount: 8500000,
    date: '2025-01-03',
    platform: 'youtube',
    verified: true
  },
  {
    id: '3',
    userName: '박크리에이터',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user3',
    amount: 12000000,
    date: '2025-01-05',
    platform: 'instagram',
    verified: false
  },
  {
    id: '4',
    userName: '최틱톡',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user4',
    amount: 6700000,
    date: '2025-01-07',
    platform: 'tiktok',
    verified: true
  },
  {
    id: '5',
    userName: '정인플루언서',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user5',
    amount: 23000000,
    date: '2025-01-10',
    platform: 'youtube',
    verified: true
  },
  {
    id: '6',
    userName: '강미디어',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user6',
    amount: 9800000,
    date: '2025-01-11',
    platform: 'instagram',
    verified: true
  },
  {
    id: '7',
    userName: '윤콘텐츠',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user7',
    amount: 14500000,
    date: '2025-01-12',
    platform: 'youtube',
    verified: true
  },
  {
    id: '8',
    userName: '장브이로거',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user8',
    amount: 7200000,
    date: '2025-01-13',
    platform: 'tiktok',
    verified: false
  },
  {
    id: '9',
    userName: '임채널',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user9',
    amount: 18900000,
    date: '2025-01-14',
    platform: 'youtube',
    verified: true
  },
  {
    id: '10',
    userName: '한스타',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user10',
    amount: 11300000,
    date: '2025-01-14',
    platform: 'instagram',
    verified: true
  },
  {
    id: '11',
    userName: '오튜브',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user11',
    amount: 5600000,
    date: '2025-01-14',
    platform: 'youtube',
    verified: true
  },
  {
    id: '12',
    userName: '서크리에이터',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user12',
    amount: 16700000,
    date: '2025-01-14',
    platform: 'youtube',
    verified: true
  },
  {
    id: '13',
    userName: '신쇼츠',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user13',
    amount: 8900000,
    date: '2025-01-14',
    platform: 'tiktok',
    verified: true
  },
  {
    id: '14',
    userName: '유인플루언서',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user14',
    amount: 21000000,
    date: '2025-01-14',
    platform: 'youtube',
    verified: true
  },
  {
    id: '15',
    userName: '노미디어',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user15',
    amount: 13400000,
    date: '2025-01-14',
    platform: 'instagram',
    verified: true
  }
];

export const dummyFreeCourses: Course[] = [
  {
    id: '1',
    title: 'YouTube Shorts 기초부터 수익화까지',
    instructor: '김강사',
    thumbnail: '/images/carousel/carousel-01.jpg',
    duration: '2시간 30분',
    level: 'beginner',
    isFree: true,
    enrollCount: 1234
  },
  {
    id: '2',
    title: '바이럴 콘텐츠 만들기',
    instructor: '이멘토',
    thumbnail: '/images/carousel/carousel-02.jpg',
    duration: '3시간',
    level: 'intermediate',
    isFree: true,
    enrollCount: 892
  },
  {
    id: '3',
    title: '알고리즘 완벽 이해',
    instructor: '박코치',
    thumbnail: '/images/carousel/carousel-03.jpg',
    duration: '1시간 45분',
    level: 'intermediate',
    isFree: true,
    enrollCount: 1567
  },
  {
    id: '4',
    title: '첫 영상 만들기',
    instructor: '최전문가',
    thumbnail: '/images/carousel/carousel-04.jpg',
    duration: '2시간',
    level: 'beginner',
    isFree: true,
    enrollCount: 2103
  },
  {
    id: '5',
    title: '편집 기초 마스터',
    instructor: '정크리에이터',
    thumbnail: '/images/carousel/carousel-01.jpg',
    duration: '4시간',
    level: 'beginner',
    isFree: true,
    enrollCount: 756
  },
  {
    id: '6',
    title: '트렌드 분석 방법',
    instructor: '강마스터',
    thumbnail: '/images/carousel/carousel-02.jpg',
    duration: '1시간 30분',
    level: 'intermediate',
    isFree: true,
    enrollCount: 945
  },
  {
    id: '7',
    title: '채널 브랜딩 전략',
    instructor: '윤샘',
    thumbnail: '/images/carousel/carousel-03.jpg',
    duration: '2시간 15분',
    level: 'advanced',
    isFree: true,
    enrollCount: 623
  },
  {
    id: '8',
    title: '커뮤니티 관리 노하우',
    instructor: '장튜터',
    thumbnail: '/images/carousel/carousel-04.jpg',
    duration: '1시간',
    level: 'beginner',
    isFree: true,
    enrollCount: 1789
  }
];

export const dummyNewCourses: Course[] = [
  {
    id: '9',
    title: '2025 최신 YouTube Shorts 트렌드',
    instructor: '임코치',
    thumbnail: '/images/carousel/carousel-01.jpg',
    duration: '3시간 30분',
    level: 'advanced',
    isFree: false,
    price: 99000,
    enrollCount: 234
  },
  {
    id: '10',
    title: 'AI 활용 콘텐츠 제작',
    instructor: '한멘토',
    thumbnail: '/images/carousel/carousel-02.jpg',
    duration: '5시간',
    level: 'intermediate',
    isFree: false,
    price: 149000,
    enrollCount: 189
  },
  {
    id: '11',
    title: '글로벌 진출 전략',
    instructor: '오선생',
    thumbnail: '/images/carousel/carousel-03.jpg',
    duration: '4시간',
    level: 'advanced',
    isFree: false,
    price: 199000,
    enrollCount: 97
  },
  {
    id: '12',
    title: '라이브 커머스 시작하기',
    instructor: '서마스터',
    thumbnail: '/images/carousel/carousel-04.jpg',
    duration: '2시간 45분',
    level: 'intermediate',
    isFree: false,
    price: 79000,
    enrollCount: 412
  }
];

export const dummyCourseSchedules: CourseSchedule[] = [
  {
    id: '1',
    courseId: '1',
    courseName: 'Shorts 입문 특강',
    instructor: '김강사',
    date: '2025-01-20',
    time: '19:00',
    isLive: true,
    registeredCount: 45,
    maxCapacity: 100
  },
  {
    id: '2',
    courseId: '2',
    courseName: '알고리즘 완벽 이해',
    instructor: '박코치',
    date: '2025-01-22',
    time: '20:00',
    isLive: true,
    registeredCount: 78,
    maxCapacity: 100
  },
  {
    id: '3',
    courseId: '3',
    courseName: '편집 실습 워크샵',
    instructor: '이멘토',
    date: '2025-01-25',
    time: '14:00',
    isLive: true,
    registeredCount: 32,
    maxCapacity: 50
  },
  {
    id: '4',
    courseId: '4',
    courseName: '수익화 전략 세미나',
    instructor: '강마스터',
    date: '2025-01-27',
    time: '19:00',
    isLive: true,
    registeredCount: 92,
    maxCapacity: 100
  },
  {
    id: '5',
    courseId: '5',
    courseName: '트렌드 분석 마스터클래스',
    instructor: '정크리에이터',
    date: '2025-01-30',
    time: '18:00',
    isLive: true,
    registeredCount: 56,
    maxCapacity: 80
  },
  {
    id: '6',
    courseId: '6',
    courseName: '브랜딩 워크샵',
    instructor: '윤샘',
    date: '2025-02-01',
    time: '15:00',
    isLive: false,
    registeredCount: 23,
    maxCapacity: 40
  },
  {
    id: '7',
    courseId: '7',
    courseName: '라이브 방송 실습',
    instructor: '임코치',
    date: '2025-02-03',
    time: '20:00',
    isLive: true,
    registeredCount: 67,
    maxCapacity: 100
  },
  {
    id: '8',
    courseId: '8',
    courseName: 'Q&A 세션: 성공 사례 분석',
    instructor: '장튜터',
    date: '2025-02-05',
    time: '19:30',
    isLive: true,
    registeredCount: 89,
    maxCapacity: 150
  }
];

export const dummyEbooks: Ebook[] = [
  {
    id: '1',
    title: 'YouTube Shorts 완벽 가이드',
    author: '김강사',
    cover: '/images/carousel/carousel-01.jpg',
    description: '초보자를 위한 YouTube Shorts 시작 가이드북',
    isFree: true,
    downloadCount: 3456,
    fileSize: '15.2MB'
  },
  {
    id: '2',
    title: '바이럴 콘텐츠의 비밀',
    author: '이멘토',
    cover: '/images/carousel/carousel-02.jpg',
    description: '100만 뷰를 달성하는 콘텐츠 제작 노하우',
    isFree: false,
    price: 29000,
    downloadCount: 1234,
    fileSize: '22.8MB'
  },
  {
    id: '3',
    title: '알고리즘 해킹 전략',
    author: '최전문가',
    cover: '/images/carousel/carousel-03.jpg',
    description: 'YouTube 알고리즘을 이해하고 활용하는 방법',
    isFree: false,
    price: 39000,
    downloadCount: 892,
    fileSize: '18.5MB'
  },
  {
    id: '4',
    title: '수익화 로드맵',
    author: '강마스터',
    cover: '/images/carousel/carousel-04.jpg',
    description: '단계별 수익화 전략과 실전 팁',
    isFree: true,
    downloadCount: 2789,
    fileSize: '12.3MB'
  },
  {
    id: '5',
    title: '편집 마스터 클래스',
    author: '장튜터',
    cover: '/images/carousel/carousel-01.jpg',
    description: '프로처럼 편집하는 비법 대공개',
    isFree: false,
    price: 49000,
    downloadCount: 567,
    fileSize: '35.7MB'
  },
  {
    id: '6',
    title: '트렌드 리포트 2025',
    author: '정크리에이터',
    cover: '/images/carousel/carousel-02.jpg',
    description: '2025년 콘텐츠 트렌드 완벽 분석',
    isFree: true,
    downloadCount: 4123,
    fileSize: '8.9MB'
  }
];

export const dummyFAQs: FAQ[] = [
  {
    id: '1',
    question: '디하클은 어떤 서비스인가요?',
    answer: '디하클은 YouTube Shorts 크리에이터를 위한 종합 교육 플랫폼입니다. 초보자부터 전문가까지 단계별 맞춤 교육을 제공하며, 실제 수익 인증을 통해 투명하고 신뢰할 수 있는 교육 환경을 제공합니다.',
    category: '일반'
  },
  {
    id: '2',
    question: '무료 강의와 유료 강의의 차이점은 무엇인가요?',
    answer: '무료 강의는 기초적인 내용과 입문 과정을 제공하며, 유료 강의는 심화 내용, 1:1 멘토링, 실습 자료, 수료증 발급 등의 추가 혜택이 포함됩니다. 또한 유료 강의는 지속적인 업데이트와 Q&A 서비스를 제공합니다.',
    category: '강의'
  },
  {
    id: '3',
    question: '강의를 수강하려면 어떻게 해야 하나요?',
    answer: '회원가입 후 원하는 강의를 선택하여 수강신청을 하시면 됩니다. 무료 강의는 바로 시청 가능하며, 유료 강의는 결제 완료 후 수강할 수 있습니다.',
    category: '강의'
  },
  {
    id: '4',
    question: '결제 방법은 어떤 것들이 있나요?',
    answer: '신용카드, 체크카드, 카카오페이, 네이버페이, 토스 등 다양한 결제 수단을 지원합니다. 또한 무이자 할부도 가능합니다.',
    category: '결제'
  },
  {
    id: '5',
    question: '환불 정책은 어떻게 되나요?',
    answer: '강의 구매 후 7일 이내, 수강 진도율 10% 미만인 경우 전액 환불이 가능합니다. 그 이후에는 수강 진도율에 따라 부분 환불이 적용됩니다.',
    category: '환불'
  },
  {
    id: '6',
    question: '수료증은 어떻게 발급받나요?',
    answer: '강의를 80% 이상 수강하고 최종 과제를 제출하면 수료증이 자동으로 발급됩니다. 마이페이지에서 다운로드할 수 있습니다.',
    category: '강의'
  },
  {
    id: '7',
    question: '강의 유효기간은 얼마나 되나요?',
    answer: '대부분의 강의는 구매 후 1년간 무제한 시청이 가능합니다. 일부 특별 강의는 유효기간이 다를 수 있으니 강의 상세 페이지를 확인해 주세요.',
    category: '강의'
  },
  {
    id: '8',
    question: '모바일에서도 수강할 수 있나요?',
    answer: '네, 모든 강의는 PC, 태블릿, 스마트폰에서 시청 가능합니다. 전용 앱도 제공하고 있어 더욱 편리하게 학습할 수 있습니다.',
    category: '일반'
  }
];