import { logger } from './logger';
import { getApiUrl } from './config';

const API_BASE_URL = getApiUrl();

export interface InquiryData {
  companyId: string;
  customerEmail: string;
  customerPassword?: string;
  category: string;
  title: string;
  content: string;
  urgency: string;
}

export interface InquiryResponse {
  inquiryId: string;
  status: string;
  estimatedResponseTime: number;
  createdAt: string;
}

export interface AIResponseData {
  aiResponse: string;
  responseTime: number;
  confidence: number;
}

export interface AIRequestData {
  title: string;
  content: string;
  category: string;
}

export async function createInquiry(data: InquiryData): Promise<InquiryResponse> {
  const url = `${API_BASE_URL}/api/inquiries`;
  
  logger.info('문의 생성 API 호출 시작', { url, data: { ...data, content: '[REDACTED]' } }, 'api');
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    logger.info('문의 생성 API 응답 수신', { 
      status: response.status, 
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    }, 'api');

    const result = await response.json();

    if (!response.ok) {
      logger.error('문의 생성 API 에러', new Error(result.error || 'Failed to create inquiry'), {
        status: response.status,
        result
      }, 'api');
      throw new Error(result.error || 'Failed to create inquiry');
    }

    logger.info('문의 생성 성공', { inquiryId: result.data?.inquiryId }, 'api');
    return result.data;
  } catch (error) {
    logger.error('문의 생성 네트워크 에러', error as Error, { url, apiBaseUrl: API_BASE_URL }, 'api');
    throw error;
  }
}

export async function generateAIResponse(data: AIRequestData): Promise<AIResponseData> {
  const url = `${API_BASE_URL}/api/ai-response`;
  
  logger.info('AI 응답 생성 API 호출 시작', { url, data: { ...data, content: '[REDACTED]' } }, 'api');
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    logger.info('AI 응답 생성 API 응답 수신', { 
      status: response.status, 
      statusText: response.statusText 
    }, 'api');

    const result = await response.json();

    if (!response.ok) {
      logger.error('AI 응답 생성 API 에러', new Error(result.error || 'Failed to generate AI response'), {
        status: response.status,
        result
      }, 'api');
      throw new Error(result.error || 'Failed to generate AI response');
    }

    logger.info('AI 응답 생성 성공', { confidence: result.data?.confidence }, 'api');
    return result.data;
  } catch (error) {
    logger.error('AI 응답 생성 네트워크 에러', error as Error, { url, data }, 'api');
    throw error;
  }
}

export async function escalateInquiry(inquiryId: string, reason?: string): Promise<void> {
  const url = `${API_BASE_URL}/api/inquiries/${inquiryId}/escalate`;
  
  logger.info('에스컬레이션 API 호출 시작', { url, inquiryId, reason }, 'api');
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    });

    logger.info('에스컬레이션 API 응답 수신', { 
      status: response.status, 
      statusText: response.statusText 
    }, 'api');

    const result = await response.json();

    if (!response.ok) {
      logger.error('에스컬레이션 API 에러', new Error(result.error || 'Failed to escalate inquiry'), {
        status: response.status,
        result
      }, 'api');
      throw new Error(result.error || 'Failed to escalate inquiry');
    }

    logger.info('에스컬레이션 성공', { inquiryId }, 'api');
  } catch (error) {
    logger.error('에스컬레이션 네트워크 에러', error as Error, { url, inquiryId }, 'api');
    throw error;
  }
}

export interface InquiryDetail {
  inquiry_id: string;
  companyId: string;
  customerEmail: string;
  category: string;
  title: string;
  content: string;
  urgency: string;
  status: string;
  created_at: string;
  updatedAt?: string;
  estimatedResponseTime: number;
}

export async function getInquiry(inquiryId: string): Promise<InquiryDetail> {
  const url = `${API_BASE_URL}/api/inquiries/${inquiryId}`;
  
  logger.info('문의 조회 API 호출 시작', { url, inquiryId }, 'api');
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    logger.info('문의 조회 API 응답 수신', { 
      status: response.status, 
      statusText: response.statusText 
    }, 'api');

    const result = await response.json();

    if (!response.ok) {
      logger.error('문의 조회 API 에러', new Error(result.error || 'Failed to get inquiry'), {
        status: response.status,
        result
      }, 'api');
      throw new Error(result.error || 'Failed to get inquiry');
    }

    logger.info('문의 조회 성공', { inquiryId }, 'api');
    return result.data || result;
  } catch (error) {
    logger.error('문의 조회 네트워크 에러', error as Error, { url, inquiryId }, 'api');
    throw error;
  }
}
