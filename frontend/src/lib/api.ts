const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface InquiryData {
  companyId: string;
  customerEmail: string;
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
  response: string;
  confidence: number;
}

export async function createInquiry(data: InquiryData): Promise<InquiryResponse> {
  const response = await fetch(`${API_BASE_URL}/api/inquiries`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Failed to create inquiry');
  }

  return result.data;
}

export async function generateAIResponse(inquiryId: string): Promise<AIResponseData> {
  const response = await fetch(`${API_BASE_URL}/api/ai-response`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ inquiryId }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Failed to generate AI response');
  }

  return result.data;
}

export async function escalateInquiry(inquiryId: string, reason?: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/inquiries/${inquiryId}/escalate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ reason }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Failed to escalate inquiry');
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
  const response = await fetch(`${API_BASE_URL}/api/inquiries/${inquiryId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Failed to get inquiry');
  }

  return result.data || result;
}