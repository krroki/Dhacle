// 캐러셀 슬라이드 데이터
export interface CarouselSlide {
  id: number;
  type: 'image' | 'youtube';
  source: string; // 이미지 경로 또는 YouTube URL
  link?: string; // 이미지일 때만 필요 (YouTube는 source가 곧 link)
}

// YouTube URL에서 Video ID 추출
export const getYouTubeVideoId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
    /youtube\.com\/\?v=([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

// YouTube 썸네일 URL 생성 (고화질)
export const getYouTubeThumbnail = (videoId: string): string => {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};

// 슬라이드 이미지 URL 가져오기
export const getSlideImage = (slide: CarouselSlide): string => {
  if (slide.type === 'youtube') {
    const videoId = getYouTubeVideoId(slide.source);
    return videoId ? getYouTubeThumbnail(videoId) : '/images/placeholder.jpg';
  }
  return slide.source;
};

// 캐러셀 슬라이드 데이터
// 이미지: public/images/carousel/ 폴더에 넣고 link 지정
// 유튜브: source만 넣으면 자동으로 썸네일과 링크 처리
export const carouselSlides: CarouselSlide[] = [
  {
    id: 1,
    type: 'youtube',
    source: 'https://www.youtube.com/watch?v=fj_AsijzIhM' // YouTube는 source만 넣으면 됨
  },
  {
    id: 2,
    type: 'image',
    source: '/images/carousel/banner1.png',
    link: 'https://cafe.naver.com/dinohighclass/81515' // 이미지는 클릭 시 이동할 링크 필요
  },
  {
    id: 3,
    type: 'youtube',
    source: 'https://www.youtube.com/watch?v=M_7tBvpVPo0'
  },
  {
    id: 4,
    type: 'image',
    source: '/images/carousel/banner2.png',
    link: 'https://cafe.naver.com/dinohighclass/79137' // 내부 페이지로 이동
  },
  {
    id: 5,
    type: 'youtube',
    source: 'https://www.youtube.com/watch?v=OSGogsT66uw' // 실제 YouTube URL로 변경하세요
  },
  {
    id: 6,
    type: 'image',
    source: '/images/carousel/banner3.png',
    link: 'https://cafe.naver.com/dinohighclass/76183' // 외부 링크 예시
  },
  {
    id: 7,
    type: 'youtube',
    source: 'https://www.youtube.com/watch?v=2iD08LbG4c0' // 실제 YouTube URL로 변경하세요
  },
  {
    id: 8,
    type: 'image',
    source: '/images/carousel/banner4.png',
    link: 'https://cafe.naver.com/dinohighclass/73148'
  },
];