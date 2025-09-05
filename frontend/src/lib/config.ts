/**
 * 환경변수 설정 및 검증 유틸리티
 */

export function getApiUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  // 개발 환경에서는 기본값 사용
  if (process.env.NODE_ENV === 'development' && !apiUrl) {
    return 'http://localhost:3001';
  }
  
  // 프로덕션 환경에서는 환경변수 필수
  if (!apiUrl) {
    throw new Error('NEXT_PUBLIC_API_URL이 설정되지 않았습니다');
  }
  
  return apiUrl;
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