/**
 * 환경변수 설정 및 검증 유틸리티
 */

export function getApiUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  // 환경변수가 설정된 경우 사용 (dev CloudFront/prod 모두)
  if (apiUrl) {
    return apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
  }
  
  // 환경변수 필수 (dev CloudFront도 API URL 필요)
  throw new Error('NEXT_PUBLIC_API_URL이 설정되지 않았습니다');
}

export function validateEnvironment(): boolean {
  try {
    getApiUrl();
    return true;
  } catch {
    return false;
  }
}

export const config = {
  apiUrl: getApiUrl(),
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
} as const;