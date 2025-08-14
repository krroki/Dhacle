import crypto from 'crypto';

// 암호화 키 검증 및 가져오기
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  }
  
  // 32바이트 (256비트) hex 문자열인지 확인
  if (key.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be a 64-character hex string (32 bytes)');
  }
  
  return Buffer.from(key, 'hex');
}

/**
 * API Key를 AES-256-CBC로 암호화
 * @param apiKey - 암호화할 API Key
 * @returns 암호화된 문자열 (iv:encrypted 형식)
 */
export function encryptApiKey(apiKey: string): string {
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    
    let encrypted = cipher.update(apiKey, 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    // IV와 암호화된 데이터를 콜론으로 구분하여 저장
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt API key');
  }
}

/**
 * 암호화된 API Key를 복호화
 * @param encryptedKey - 암호화된 문자열 (iv:encrypted 형식)
 * @returns 복호화된 API Key
 */
export function decryptApiKey(encryptedKey: string): string {
  try {
    const key = getEncryptionKey();
    const parts = encryptedKey.split(':');
    
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted key format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = Buffer.from(parts[1], 'hex');
    
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted.toString('utf8');
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt API key');
  }
}

/**
 * API Key를 마스킹 (표시용)
 * @param apiKey - 마스킹할 API Key
 * @returns 마스킹된 문자열 (예: AIza...XXX)
 */
export function maskApiKey(apiKey: string): string {
  if (!apiKey || apiKey.length < 10) {
    return '***';
  }
  
  const visibleStart = 4;
  const visibleEnd = 3;
  
  if (apiKey.length <= visibleStart + visibleEnd) {
    return apiKey.substring(0, visibleStart) + '...';
  }
  
  return (
    apiKey.substring(0, visibleStart) +
    '...' +
    apiKey.substring(apiKey.length - visibleEnd)
  );
}

/**
 * 암호화 키 생성 (초기 설정용)
 * @returns 32바이트 hex 문자열
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * API Key 유효성 기본 검증
 * @param apiKey - 검증할 API Key
 * @param service - 서비스 이름 (youtube, openai 등)
 * @returns 유효성 여부
 */
export function validateApiKeyFormat(apiKey: string, service: string = 'youtube'): boolean {
  if (!apiKey || typeof apiKey !== 'string') {
    return false;
  }
  
  // 서비스별 형식 검증
  switch (service) {
    case 'youtube':
      // YouTube API Key는 일반적으로 AIza로 시작하고 39자
      return /^AIza[0-9A-Za-z_-]{35}$/.test(apiKey);
    
    case 'openai':
      // OpenAI API Key는 sk-로 시작
      return /^sk-[A-Za-z0-9]{48}$/.test(apiKey);
    
    default:
      // 기본적으로 최소 길이만 확인
      return apiKey.length >= 20;
  }
}

/**
 * 환경 변수에서 암호화 키 존재 여부 확인
 * @returns 암호화 키 설정 여부
 */
export function hasEncryptionKey(): boolean {
  return !!process.env.ENCRYPTION_KEY && process.env.ENCRYPTION_KEY.length === 64;
}

/**
 * 안전한 비교 (타이밍 공격 방지)
 * @param a - 첫 번째 문자열
 * @param b - 두 번째 문자열
 * @returns 동일 여부
 */
export function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  return crypto.timingSafeEqual(
    Buffer.from(a),
    Buffer.from(b)
  );
}