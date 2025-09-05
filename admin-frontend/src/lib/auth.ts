const API_BASE_URL = 'http://localhost:3001'

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  access_token: string
  expires_in: number
  redirect: {
    hasQnASetup: boolean
    nextRoute: string
    message: string
  }
}

export interface VerifyResponse {
  valid: boolean
  user?: {
    username: string
  }
}

export class AuthService {
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      throw new Error('로그인에 실패했습니다')
    }

    return response.json()
  }

  static async verify(token: string): Promise<VerifyResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('토큰 검증에 실패했습니다')
    }

    return response.json()
  }

  static getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('admin_token')
  }

  static setToken(token: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem('admin_token', token)
  }

  static removeToken(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem('admin_token')
  }
}