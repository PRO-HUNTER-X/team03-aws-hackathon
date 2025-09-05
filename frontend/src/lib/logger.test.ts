import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Logger, LogLevel } from './logger';

describe('Logger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('log', () => {
    it('로그를 localStorage에 저장해야 함', () => {
      // Given
      const logger = new Logger();
      const message = '테스트 로그 메시지';

      // When
      logger.log(LogLevel.INFO, message);

      // Then
      const logs = JSON.parse(localStorage.getItem('app_logs') || '[]');
      expect(logs).toHaveLength(1);
      expect(logs[0]).toMatchObject({
        level: 'INFO',
        message,
        category: 'general'
      });
      expect(logs[0].timestamp).toBeDefined();
    });

    it('에러 로그를 올바르게 저장해야 함', () => {
      // Given
      const logger = new Logger();
      const error = new Error('테스트 에러');
      const context = { userId: 'test123' };

      // When
      logger.error('API 호출 실패', error, context);

      // Then
      const logs = JSON.parse(localStorage.getItem('app_logs') || '[]');
      expect(logs[0]).toMatchObject({
        level: 'ERROR',
        message: 'API 호출 실패',
        category: 'general',
        error: {
          name: 'Error',
          message: '테스트 에러',
          stack: expect.any(String)
        },
        context
      });
    });

    it('최대 로그 개수를 초과하면 오래된 로그를 제거해야 함', () => {
      // Given
      const logger = new Logger({ maxLogs: 3 });

      // When
      logger.info('로그 1');
      logger.info('로그 2');
      logger.info('로그 3');
      logger.info('로그 4');

      // Then
      const logs = JSON.parse(localStorage.getItem('app_logs') || '[]');
      expect(logs).toHaveLength(3);
      expect(logs[0].message).toBe('로그 2');
      expect(logs[2].message).toBe('로그 4');
    });
  });

  describe('getLogs', () => {
    it('저장된 로그를 반환해야 함', () => {
      // Given
      const logger = new Logger();
      logger.info('테스트 로그');

      // When
      const logs = logger.getLogs();

      // Then
      expect(logs).toHaveLength(1);
      expect(logs[0].message).toBe('테스트 로그');
    });

    it('레벨별로 필터링된 로그를 반환해야 함', () => {
      // Given
      const logger = new Logger();
      logger.info('정보 로그');
      logger.error('에러 로그');
      logger.warn('경고 로그');

      // When
      const errorLogs = logger.getLogs(LogLevel.ERROR);

      // Then
      expect(errorLogs).toHaveLength(1);
      expect(errorLogs[0].level).toBe('ERROR');
    });
  });
});