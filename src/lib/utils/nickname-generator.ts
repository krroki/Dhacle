/**
 * 랜덤 닉네임 생성 유틸리티
 * 형식: [형용사] + [동물]
 * 예: "용감한사자", "활발한고양이"
 */

// 형용사 목록 (50개)
const adjectives = [
  '용감한',
  '활발한',
  '똑똑한',
  '귀여운',
  '멋진',
  '재빠른',
  '강한',
  '부드러운',
  '날렵한',
  '즐거운',
  '행복한',
  '신나는',
  '빛나는',
  '따뜻한',
  '시원한',
  '상큼한',
  '달콤한',
  '깔끔한',
  '산뜻한',
  '포근한',
  '든든한',
  '씩씩한',
  '당당한',
  '우아한',
  '화려한',
  '조용한',
  '차분한',
  '성실한',
  '부지런한',
  '열정적인',
  '창의적인',
  '도전적인',
  '긍정적인',
  '활기찬',
  '명랑한',
  '쾌활한',
  '유쾌한',
  '상냥한',
  '친절한',
  '정직한',
  '겸손한',
  '지혜로운',
  '현명한',
  '영리한',
  '재치있는',
  '센스있는',
  '매력적인',
  '사랑스런',
  '깜찍한',
  '발랄한',
];

// 동물 목록 (50개)
const animals = [
  '사자',
  '호랑이',
  '곰',
  '토끼',
  '고양이',
  '강아지',
  '여우',
  '늑대',
  '사슴',
  '다람쥐',
  '햄스터',
  '고슴도치',
  '수달',
  '너구리',
  '판다',
  '코알라',
  '캥거루',
  '원숭이',
  '고릴라',
  '침팬지',
  '펭귄',
  '독수리',
  '매',
  '올빼미',
  '앵무새',
  '까마귀',
  '비둘기',
  '참새',
  '제비',
  '두루미',
  '백조',
  '오리',
  '거위',
  '닭',
  '공작',
  '돌고래',
  '고래',
  '상어',
  '가오리',
  '해마',
  '거북이',
  '악어',
  '도마뱀',
  '카멜레온',
  '이구아나',
  '나비',
  '벌',
  '개미',
  '거미',
  '전갈',
];

/**
 * 랜덤 닉네임 생성
 * @returns 생성된 닉네임
 */
export function generateRandomNickname(): string {
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
  return `${randomAdjective}${randomAnimal}`;
}

/**
 * 여러 개의 랜덤 닉네임 생성 (중복 체크용)
 * @param count 생성할 개수
 * @returns 생성된 닉네임 배열
 */
export function generateMultipleNicknames(count = 5): string[] {
  const nicknames = new Set<string>();

  while (nicknames.size < count && nicknames.size < adjectives.length * animals.length) {
    nicknames.add(generateRandomNickname());
  }

  return Array.from(nicknames);
}

/**
 * 닉네임 유효성 검사
 * @param nickname 검사할 닉네임
 * @returns 유효 여부
 */
export function isValidNickname(nickname: string): boolean {
  // 2-20자 길이
  if (nickname.length < 2 || nickname.length > 20) {
    return false;
  }

  // 특수문자 제외 (한글, 영문, 숫자만 허용)
  const validPattern = /^[가-힣a-zA-Z0-9]+$/;
  return validPattern.test(nickname);
}

/**
 * 디지털 노마드 하이클래스 카페 설정
 */
export const DINOHIGHCLASS_CAFE = {
  id: 'dinohighclass',
  name: '디지털 노마드 하이클래스',
  url: 'https://cafe.naver.com/dinohighclass',
};

/**
 * 네이버 카페 URL 유효성 검사 (디지털 노마드 하이클래스 전용)
 * @param url 검사할 URL
 * @returns 유효 여부
 */
export function isValidNaverCafeUrl(url: string): boolean {
  // 디지털 노마드 하이클래스 카페 URL만 허용
  // https://cafe.naver.com/dinohighclass 또는 https://cafe.naver.com/dinohighclass/member/[멤버ID]
  const cafeUrlPattern = new RegExp(
    `^https?:\\/\\/cafe\\.naver\\.com\\/${DINOHIGHCLASS_CAFE.id}(\\/member\\/[\\w-]+)?$`
  );
  return cafeUrlPattern.test(url);
}

/**
 * 디지털 노마드 하이클래스 카페 URL인지 확인
 * @param url 검사할 URL
 * @returns dinohighclass 카페 여부
 */
export function isDinoHighClassCafeUrl(url: string): boolean {
  return url.toLowerCase().includes(`cafe.naver.com/${DINOHIGHCLASS_CAFE.id}`);
}

/**
 * 닉네임 포맷팅 (표시용)
 * @param nickname 원본 닉네임
 * @param maxLength 최대 길이
 * @returns 포맷된 닉네임
 */
export function formatNickname(nickname: string, maxLength = 10): string {
  if (!nickname) return '익명';

  if (nickname.length <= maxLength) {
    return nickname;
  }

  return `${nickname.substring(0, maxLength - 2)}...`;
}

/**
 * 닉네임 종류 구분
 * @param profile 프로필 객체
 * @returns 닉네임 타입
 */
export function getNicknameType(profile: {
  naverCafeVerified?: boolean;
  naverCafeNickname?: string | null;
  randomNickname?: string | null;
}): 'naver' | 'random' | 'none' {
  if (profile.naverCafeVerified && profile.naverCafeNickname) {
    return 'naver';
  }
  if (profile.randomNickname) {
    return 'random';
  }
  return 'none';
}

/**
 * 표시할 닉네임 가져오기
 * @param profile 프로필 객체
 * @returns 표시할 닉네임
 */
export function getDisplayNickname(profile: {
  naverCafeVerified?: boolean;
  naverCafeNickname?: string | null;
  randomNickname?: string | null;
  username?: string | null;
}): string {
  // 우선순위: 네이버 카페 닉네임 > 랜덤 닉네임 > username > 익명
  if (profile.naverCafeVerified && profile.naverCafeNickname) {
    return profile.naverCafeNickname;
  }
  if (profile.randomNickname) {
    return profile.randomNickname;
  }
  if (profile.username) {
    return profile.username;
  }
  return '익명';
}
