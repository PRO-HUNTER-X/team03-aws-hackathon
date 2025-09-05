import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getApiUrl, validateEnvironment } from './config';

describe('Config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('getApiUrl', () => {
    it('개발 환경에서 localhost URL을 반환해야 함', () => {
      // Given
      process.env.NODE_ENV = 'development';
      delete process.env.NEXT_PUBLIC_API_URL;

      // When
      const apiUrl = getApiUrl();

      // Then
      expect(apiUrl).toBe('http://localhost:3001');
    });

    it('환경변수가 설정된 경우 해당 URL을 반환해야 함', () => {
      // Given
      process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com';

      // When
      const apiUrl = getApiUrl();

      // Then
      expect(apiUrl).toBe('https://api.example.com');
    });

    it('프로덕션 환경에서 환경변수가 없으면 에러를 던져야 함', () => {
      // Given
      process.env.NODE_ENV = 'production';
      delete process.env.NEXT_PUBLIC_API_URL;

      // When & Then
      expect(() => getApiUrl()).toThrow('NEXT_PUBLIC_API_URL이 설정되지 않았습니다');
    });
  });

  describe('validateEnvironment', () => {
    it('필수 환경변수가 모두 설정된 경우 true를 반환해야 함', () => {
      // Given
      process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com';

      // When
      const isValid = validateEnvironment();

      // Then
      expect(isValid).toBe(true);
    });

    it('필수 환경변수가 누락된 경우 false를 반환해야 함', () => {
      // Given
      delete process.env.NEXT_PUBLIC_API_URL;
      process.env.NODE_ENV = 'production';

      // When
      const isValid = validateEnvironment();

      // Then
      expect(isValid).toBe(false);
    });
  });
});