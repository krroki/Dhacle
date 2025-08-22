/**
 * YouTube Lens 한국어 숫자 포맷팅 유틸리티
 * 요구사항: 반드시 천/만 단위 사용, k/m 사용 금지
 */

/**
 * 숫자를 한국어 형식으로 포맷팅 (천/만 단위)
 * @param num 포맷할 숫자
 * @param decimals 소수점 자리수 (기본값: 1)
 * @returns 포맷된 문자열 (예: "1.2천", "12.3만", "1234만")
 */
export function formatNumberKo(num: number | null | undefined, decimals = 1): string {
  // null/undefined 처리
  if (num == null) return '0';

  // 음수 처리
  const is_negative = num < 0;
  const abs_num = Math.abs(num);

  // 1000 미만
  if (abs_num < 1000) {
    return is_negative ? `-${abs_num}` : `${abs_num}`;
  }

  // 1천 ~ 1만 미만
  if (abs_num < 10000) {
    const value = (abs_num / 1000).toFixed(decimals);
    const formatted =
      Number.parseFloat(value) === Math.floor(Number.parseFloat(value))
        ? Math.floor(Number.parseFloat(value)).toString()
        : value;
    return is_negative ? `-${formatted}천` : `${formatted}천`;
  }

  // 1만 이상
  const value = (abs_num / 10000).toFixed(decimals);
  const formatted =
    Number.parseFloat(value) === Math.floor(Number.parseFloat(value))
      ? Math.floor(Number.parseFloat(value)).toString()
      : value;
  return is_negative ? `-${formatted}만` : `${formatted}만`;
}

/**
 * 델타(변화량) 표시용 포맷팅
 * @param delta 변화량
 * @returns +/- 부호가 포함된 포맷된 문자열
 */
export function formatDelta(delta: number | null | undefined): string {
  if (delta == null || delta === 0) return '0';

  const formatted = formatNumberKo(Math.abs(delta));
  return delta > 0 ? `+${formatted}` : `-${formatted}`;
}

/**
 * 퍼센트 포맷팅
 * @param value 퍼센트 값
 * @param decimals 소수점 자리수
 * @returns 포맷된 퍼센트 문자열
 */
export function formatPercent(value: number | null | undefined, decimals = 1): string {
  if (value == null) return '0%';

  const formatted = value.toFixed(decimals);
  const clean_formatted =
    Number.parseFloat(formatted) === Math.floor(Number.parseFloat(formatted))
      ? Math.floor(Number.parseFloat(formatted)).toString()
      : formatted;

  return `${clean_formatted}%`;
}

/**
 * 성장률 포맷팅 (양수는 +, 음수는 -, 0은 표시 안함)
 * @param rate 성장률
 * @returns 포맷된 성장률 문자열
 */
export function formatGrowthRate(rate: number | null | undefined): string {
  if (rate == null || rate === 0) return '0%';

  const formatted = formatPercent(Math.abs(rate));
  return rate > 0 ? `+${formatted}` : `-${formatted}`;
}

/**
 * 큰 숫자 축약 표시 (구독자수, 총 조회수 등)
 * @param num 숫자
 * @returns 축약된 문자열
 */
export function formatLargeNumber(num: number | null | undefined): string {
  if (num == null) return '0';

  const abs_num = Math.abs(num);

  // 1억 이상
  if (abs_num >= 100000000) {
    const value = (abs_num / 100000000).toFixed(1);
    const formatted =
      Number.parseFloat(value) === Math.floor(Number.parseFloat(value))
        ? Math.floor(Number.parseFloat(value)).toString()
        : value;
    return num < 0 ? `-${formatted}억` : `${formatted}억`;
  }

  // 일반 포맷팅
  return formatNumberKo(num);
}

/**
 * 시간 경과 표시 (몇 분 전, 몇 시간 전 등)
 * @param date Date 객체 또는 ISO 문자열
 * @returns 상대 시간 문자열
 */
export function formatTimeAgo(date: Date | string): string {
  const now = new Date();
  const target = typeof date === 'string' ? new Date(date) : date;
  const diff = now.getTime() - target.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}일 전`;
  if (hours > 0) return `${hours}시간 전`;
  if (minutes > 0) return `${minutes}분 전`;
  return '방금 전';
}
