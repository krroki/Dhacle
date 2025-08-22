import CryptoJS from 'crypto-js';

/**
 * 암호화 유틸리티 클래스
 * API 키와 토큰을 안전하게 저장하기 위한 암호화/복호화 기능
 */
export class CryptoUtil {
  private static getEncryptionKey(): string {
    const key = process.env.ENCRYPTION_KEY;
    if (!key) {
      throw new Error(
        '암호화 키가 설정되지 않았습니다. ' +
          'ENCRYPTION_KEY 환경 변수를 설정해주세요. ' +
          '생성 방법: Node.js 콘솔에서 require("crypto").randomBytes(32).toString("hex") 실행'
      );
    }
    if (key.length < 32) {
      throw new Error(
        `암호화 키가 너무 짧습니다. 현재 길이: ${key.length}자, 최소 길이: 32자. ` +
          '더 긴 암호화 키를 생성해주세요.'
      );
    }
    return key;
  }

  /**
   * 텍스트를 AES-256으로 암호화
   */
  static encrypt(text: string): string {
    try {
      const key = CryptoUtil.getEncryptionKey();
      const encrypted = CryptoJS.AES.encrypt(text, key, {
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });
      return encrypted.toString();
    } catch (_error) {
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * 암호화된 텍스트를 복호화
   */
  static decrypt(encrypted_text: string): string {
    try {
      const key = CryptoUtil.getEncryptionKey();
      const decrypted = CryptoJS.AES.decrypt(encrypted_text, key, {
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });
      const decrypted_text = decrypted.toString(CryptoJS.enc.Utf8);

      if (!decrypted_text) {
        throw new Error('Failed to decrypt - invalid key or corrupted data');
      }

      return decrypted_text;
    } catch (_error) {
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * 객체를 JSON 문자열로 변환 후 암호화
   */
  static encryptObject<T>(obj: T): string {
    const json_string = JSON.stringify(obj);
    return CryptoUtil.encrypt(json_string);
  }

  /**
   * 암호화된 문자열을 복호화 후 객체로 변환
   */
  static decryptObject<T>(encrypted_text: string): T {
    const decrypted_text = CryptoUtil.decrypt(encrypted_text);
    return JSON.parse(decrypted_text) as T;
  }

  /**
   * CSRF 토큰 생성
   */
  static generateCSRFToken(): string {
    const random_bytes = CryptoJS.lib.WordArray.random(32);
    return CryptoJS.enc.Base64.stringify(random_bytes);
  }

  /**
   * CSRF 토큰 검증
   */
  static verifyCSRFToken(token: string, stored_token: string): boolean {
    if (!token || !stored_token) {
      return false;
    }
    // 타이밍 공격 방지를 위한 안전한 비교
    return CryptoJS.SHA256(token).toString() === CryptoJS.SHA256(stored_token).toString();
  }

  /**
   * API 키 마스킹 (표시용)
   */
  static maskApiKey(api_key: string): string {
    if (!api_key || api_key.length < 8) {
      return '***';
    }
    const first_four = api_key.substring(0, 4);
    const last_four = api_key.substring(api_key.length - 4);
    return `${first_four}...${last_four}`;
  }

  /**
   * 해시 생성 (단방향)
   */
  static hash(text: string): string {
    return CryptoJS.SHA256(text).toString();
  }

  /**
   * 시간 제한 토큰 생성
   */
  static generateTimeLimitedToken(data: unknown, expires_in_minutes = 15): string {
    const expires_at = Date.now() + expires_in_minutes * 60 * 1000;
    const payload = {
      data,
      expires_at,
    };
    return CryptoUtil.encryptObject(payload);
  }

  /**
   * 시간 제한 토큰 검증 및 디코드
   */
  static verifyTimeLimitedToken<T>(token: string): T | null {
    try {
      const payload = CryptoUtil.decryptObject<{ data: T; expires_at: number }>(token);

      if (Date.now() > payload.expires_at) {
        return null;
      }

      return payload.data;
    } catch (_error) {
      return null;
    }
  }
}
