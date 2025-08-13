import CryptoJS from 'crypto-js';

/**
 * 암호화 유틸리티 클래스
 * API 키와 토큰을 안전하게 저장하기 위한 암호화/복호화 기능
 */
export class CryptoUtil {
  private static getEncryptionKey(): string {
    const key = process.env.ENCRYPTION_KEY;
    if (!key) {
      throw new Error('ENCRYPTION_KEY is not defined in environment variables');
    }
    if (key.length < 32) {
      throw new Error('ENCRYPTION_KEY must be at least 32 characters long');
    }
    return key;
  }

  /**
   * 텍스트를 AES-256으로 암호화
   */
  static encrypt(text: string): string {
    try {
      const key = this.getEncryptionKey();
      const encrypted = CryptoJS.AES.encrypt(text, key, {
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });
      return encrypted.toString();
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * 암호화된 텍스트를 복호화
   */
  static decrypt(encryptedText: string): string {
    try {
      const key = this.getEncryptionKey();
      const decrypted = CryptoJS.AES.decrypt(encryptedText, key, {
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });
      const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
      
      if (!decryptedText) {
        throw new Error('Failed to decrypt - invalid key or corrupted data');
      }
      
      return decryptedText;
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * 객체를 JSON 문자열로 변환 후 암호화
   */
  static encryptObject<T>(obj: T): string {
    const jsonString = JSON.stringify(obj);
    return this.encrypt(jsonString);
  }

  /**
   * 암호화된 문자열을 복호화 후 객체로 변환
   */
  static decryptObject<T>(encryptedText: string): T {
    const decryptedText = this.decrypt(encryptedText);
    return JSON.parse(decryptedText) as T;
  }

  /**
   * CSRF 토큰 생성
   */
  static generateCSRFToken(): string {
    const randomBytes = CryptoJS.lib.WordArray.random(32);
    return CryptoJS.enc.Base64.stringify(randomBytes);
  }

  /**
   * CSRF 토큰 검증
   */
  static verifyCSRFToken(token: string, storedToken: string): boolean {
    if (!token || !storedToken) {
      return false;
    }
    // 타이밍 공격 방지를 위한 안전한 비교
    return CryptoJS.SHA256(token).toString() === CryptoJS.SHA256(storedToken).toString();
  }

  /**
   * API 키 마스킹 (표시용)
   */
  static maskApiKey(apiKey: string): string {
    if (!apiKey || apiKey.length < 8) {
      return '***';
    }
    const firstFour = apiKey.substring(0, 4);
    const lastFour = apiKey.substring(apiKey.length - 4);
    return `${firstFour}...${lastFour}`;
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
  static generateTimeLimitedToken(data: unknown, expiresInMinutes: number = 15): string {
    const expiresAt = Date.now() + (expiresInMinutes * 60 * 1000);
    const payload = {
      data,
      expiresAt
    };
    return this.encryptObject(payload);
  }

  /**
   * 시간 제한 토큰 검증 및 디코드
   */
  static verifyTimeLimitedToken<T>(token: string): T | null {
    try {
      const payload = this.decryptObject<{ data: T; expiresAt: number }>(token);
      
      if (Date.now() > payload.expiresAt) {
        console.warn('Token has expired');
        return null;
      }
      
      return payload.data;
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  }
}