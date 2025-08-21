/**
 * 사용자명 자동 생성 유틸리티
 * 형식: creator_[8자리 랜덤 문자열]
 * 예: creator_a1b2c3d4
 */

/**
 * 랜덤 사용자명 생성
 * @returns 생성된 사용자명
 */
export function generateRandomUsername(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';

  for (let i = 0; i < 8; i++) {
    randomString += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return `creator_${randomString}`;
}

/**
 * 여러 개의 랜덤 사용자명 생성
 * @param count 생성할 개수
 * @returns 생성된 사용자명 배열
 */
export function generateMultipleUsernames(count = 5): string[] {
  const usernames = new Set<string>();

  while (usernames.size < count) {
    usernames.add(generateRandomUsername());
  }

  return Array.from(usernames);
}

/**
 * 사용자명 유효성 검사
 * @param username 검사할 사용자명
 * @returns 유효 여부
 */
export function isValidUsername(username: string): boolean {
  // 3-20자 길이
  if (username.length < 3 || username.length > 20) {
    return false;
  }

  // 영문, 숫자, 언더스코어만 허용
  const validPattern = /^[a-zA-Z0-9_]+$/;
  return validPattern.test(username);
}
