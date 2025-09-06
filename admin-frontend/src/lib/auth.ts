const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3002/api' 
  : '/api'

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

export interface Company {
  companyId: string
  companyName: string
  industry: string
  size: string
  monthlyRevenue: number
}

export interface InitialRouteResponse {
  success: boolean
  data: {
    hasQnAData: boolean
    companyInfo: Company
    redirectTo: string
    qnaCount: number
  }
}

export interface Company {
  companyId: string
  companyName: string
  industry: string
  size: string
  monthlyRevenue: number
}

export interface InitialRouteResponse {
  success: boolean
  data: {
    hasQnAData: boolean
    companyInfo: Company
    redirectTo: string
    qnaCount: number
  }
}

export class AuthService {
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
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
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('토큰 검증에 실패했습니다')
    }

    return response.json()
  }

  static async getInitialRoute(companyId: string): Promise<InitialRouteResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/initial-route?companyId=${companyId}`, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('초기 라우팅 정보를 가져올 수 없습니다')
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

  static setCompanyId(companyId: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem('company_id', companyId)
  }

  static getCompanyId(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('company_id')
  }
}