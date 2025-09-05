export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'https://your-api-gateway-url.amazonaws.com/prod',
  ENDPOINTS: {
    LOGIN: '/auth/login',
    VERIFY: '/auth/verify'
  }
}