import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002',
  headers: {
    'Content-Type': 'application/json'
  }
})

// 토큰 자동 추가
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 응답 인터셉터 - Lambda 응답 형식 처리
api.interceptors.response.use(
  (response) => {
    // Lambda 성공 응답 처리
    if (response.data?.success === true) {
      response.data = response.data.data
    }
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token')
      window.location.href = '/admin/login'
    }
    // Lambda 에러 응답 처리
    if (error.response?.data?.success === false) {
      error.response.data = { error: error.response.data.error.message }
    }
    return Promise.reject(error)
  }
)

export default api