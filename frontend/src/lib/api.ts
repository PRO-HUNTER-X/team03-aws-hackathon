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

export interface Inquiry {
  id: string;
  title: string;
  content: string;
  status: 'pending' | 'ai_responded' | 'human_responded' | 'resolved';
  created_at: string;
  updated_at: string;
  category: string;
  ai_response?: string;
  human_response?: string;
  ai_responded_at?: string;
  human_responded_at?: string;
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
  aiResponse?: string;
  ai_response?: string;
  humanResponse?: string;
  human_response?: string;
  ai_responded_at?: string;
  human_responded_at?: string;
}

export const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'pending': return '접수됨';
    case 'ai_responded': return 'AI 답변 완료';
    case 'human_responded': return '상담사 답변 완료';
    case 'resolved': return '해결됨';
    default: return '알 수 없음';
  }
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'ai_responded': return 'bg-blue-100 text-blue-800';
    case 'human_responded': return 'bg-green-100 text-green-800';
    case 'resolved': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export async function getMyInquiries(email?: string): Promise<Inquiry[]> {
  const url = `${API_BASE_URL}/api/inquiries${email ? `?email=${email}` : ''}`;
  
  logger.info('내 문의 목록 조회 API 호출 시작', { url }, 'api');
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    logger.info('내 문의 목록 조회 API 응답 수신', { 
      status: response.status, 
      statusText: response.statusText 
    }, 'api');

    const result = await response.json();

    if (!response.ok) {
      logger.error('내 문의 목록 조회 API 에러', new Error(result.error || 'Failed to get inquiries'), {
        status: response.status,
        result
      }, 'api');
      throw new Error(result.error || 'Failed to get inquiries');
    }

    logger.info('내 문의 목록 조회 성공', { count: result.data?.length || 0 }, 'api');
    const inquiries = result.data?.inquiries || [];
    logger.info('원본 API 응답', { 
      inquiries: inquiries.slice(0, 1),
      fullResult: result,
      inquiriesLength: inquiries.length 
    }, 'api');
    
    // API 응답을 프론트엔드 형식에 맞게 변환
    interface ApiInquiry {
      inquiry_id: string;
      title: string;
      content: string;
      status: string;
      created_at: string;
      updatedAt?: string;
      category: string;
      aiResponse?: string;
      ai_response?: string;
      humanResponse?: string;
      human_response?: string;
      ai_responded_at?: string;
    }
    
    const mappedInquiries = inquiries.map((inquiry: ApiInquiry) => {
      const mapped = {
        id: inquiry.inquiry_id,
        title: inquiry.title,
        content: inquiry.content,
        status: inquiry.status,
        created_at: inquiry.created_at,
        updated_at: inquiry.updatedAt || inquiry.created_at,
        category: inquiry.category,
        ai_response: inquiry.aiResponse || inquiry.ai_response,
        human_response: inquiry.humanResponse || inquiry.human_response,
        ai_responded_at: inquiry.ai_responded_at
      };
      logger.info('매핑된 문의', { 
        original: inquiry.inquiry_id, 
        mapped: mapped.id,
        originalStatus: inquiry.status,
        mappedStatus: mapped.status,
        hasAiResponse: !!mapped.ai_response
      }, 'api');
      return mapped;
    });
    
    return mappedInquiries;
  } catch (error) {
    logger.error('내 문의 목록 조회 네트워크 에러', error as Error, { url }, 'api');
    throw error;
  }
}

export async function getInquiryById(id: string): Promise<Inquiry | null> {
  try {
    const detail = await getInquiry(id);
    logger.info('문의 상세 조회 원본 데이터', { 
      detail,
      hasAiResponse: !!(detail.aiResponse || detail.ai_response),
      status: detail.status
    }, 'api');
    
    const mapped = {
      id: detail.inquiry_id,
      title: detail.title,
      content: detail.content,
      status: detail.status as 'pending' | 'ai_responded' | 'human_responded' | 'resolved',
      created_at: detail.created_at,
      updated_at: detail.updatedAt || detail.created_at,
      category: detail.category,
      ai_response: detail.aiResponse || detail.ai_response,
      human_response: detail.humanResponse || detail.human_response,
      ai_responded_at: detail.ai_responded_at
    };
    
    logger.info('문의 상세 조회 매핑 결과', { 
      mappedId: mapped.id,
      mappedStatus: mapped.status,
      hasAiResponse: !!mapped.ai_response,
      aiResponseLength: mapped.ai_response?.length || 0
    }, 'api');
    
    return mapped;
  } catch (error) {
    logger.error('문의 상세 조회 실패', error as Error, { id }, 'api');
    return null;
  }
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
