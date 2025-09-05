import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createInquiry, generateAIResponse, escalateInquiry } from './api';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('API Client', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('createInquiry', () => {
    it('문의 생성 성공시 inquiryId를 반환해야 함', async () => {
      // Given
      const mockResponse = {
        success: true,
        data: {
          inquiryId: 'test-inquiry-123',
          status: 'pending',
          estimatedResponseTime: 15,
          createdAt: '2024-01-01T00:00:00Z'
        }
      };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const inquiryData = {
        companyId: 'test-company',
        customerEmail: 'test@example.com',
        category: 'technical',
        title: '테스트 문의',
        content: '테스트 내용입니다',
        urgency: 'medium'
      };

      // When
      const result = await createInquiry(inquiryData);

      // Then
      expect(result.inquiryId).toBe('test-inquiry-123');
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/inquiries'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(inquiryData)
        })
      );
    });

    it('API 에러시 예외를 던져야 함', async () => {
      // Given
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ success: false, error: 'Invalid input' })
      });

      // When & Then
      await expect(createInquiry({
        companyId: 'test',
        customerEmail: 'test@test.com',
        category: 'technical',
        title: 'test',
        content: 'test content',
        urgency: 'low'
      })).rejects.toThrow('Invalid input');
    });
  });

  describe('generateAIResponse', () => {
    it('AI 응답 생성 성공시 응답을 반환해야 함', async () => {
      // Given
      const mockResponse = {
        success: true,
        data: {
          response: '## AI 응답\n테스트 응답입니다.',
          confidence: 0.95
        }
      };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      // When
      const result = await generateAIResponse('test-inquiry-123');

      // Then
      expect(result.response).toContain('AI 응답');
      expect(result.confidence).toBe(0.95);
    });
  });

  describe('escalateInquiry', () => {
    it('에스컬레이션 성공시 완료되어야 함', async () => {
      // Given
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      // When & Then
      await expect(escalateInquiry('test-inquiry-123', '고객 불만족')).resolves.not.toThrow();
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/inquiries/test-inquiry-123/escalate'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: '고객 불만족' })
        })
      );
    });
  });
});
