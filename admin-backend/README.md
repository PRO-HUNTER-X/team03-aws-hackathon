# Admin Backend - 프론트엔드 직접 처리 방식

## 🎯 변경 사항

**기존**: Lambda 함수로 인증 처리  
**변경**: 프론트엔드에서 직접 AWS Cognito 사용

## 💡 왜 변경했나?

1. **개발 속도**: 람다 배포 없이 즉시 테스트
2. **서버리스 패턴**: 프론트엔드 직접 AWS 서비스 호출
3. **비용 절약**: 람다 실행 비용 제거
4. **단순화**: 중간 계층 제거

## 🔧 프론트엔드 구현 예시

### 1. AWS Cognito 설정
```javascript
// lib/auth.js
import { CognitoIdentityProviderClient, InitiateAuthCommand } from '@aws-sdk/client-cognito-identity-provider'

const cognitoClient = new CognitoIdentityProviderClient({
  region: 'us-east-1'
})

export const adminLogin = async (username, password) => {
  try {
    const command = new InitiateAuthCommand({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password
      }
    })
    
    const response = await cognitoClient.send(command)
    
    return {
      success: true,
      data: {
        access_token: response.AuthenticationResult.AccessToken,
        expires_in: response.AuthenticationResult.ExpiresIn
      }
    }
  } catch (error) {
    return {
      success: false,
      error: { message: '인증에 실패했습니다' }
    }
  }
}
```

### 2. 토큰 검증
```javascript
// lib/auth.js
import { CognitoIdentityProviderClient, GetUserCommand } from '@aws-sdk/client-cognito-identity-provider'

export const verifyToken = async (accessToken) => {
  try {
    const command = new GetUserCommand({
      AccessToken: accessToken
    })
    
    const response = await cognitoClient.send(command)
    
    return {
      success: true,
      data: {
        username: response.Username,
        userId: response.UserSub
      }
    }
  } catch (error) {
    return {
      success: false,
      error: { message: '토큰이 유효하지 않습니다' }
    }
  }
}
```

### 3. 로그인 컴포넌트
```javascript
// components/AdminLogin.jsx
import { useState } from 'react'
import { adminLogin } from '@/lib/auth'

export default function AdminLogin() {
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    const result = await adminLogin(credentials.username, credentials.password)
    
    if (result.success) {
      localStorage.setItem('admin_token', result.data.access_token)
      // 관리자 페이지로 리다이렉트
    } else {
      alert(result.error.message)
    }
    
    setLoading(false)
  }

  return (
    <form onSubmit={handleLogin}>
      <input
        type="text"
        placeholder="사용자명"
        value={credentials.username}
        onChange={(e) => setCredentials({...credentials, username: e.target.value})}
      />
      <input
        type="password"
        placeholder="비밀번호"
        value={credentials.password}
        onChange={(e) => setCredentials({...credentials, password: e.target.value})}
      />
      <button type="submit" disabled={loading}>
        {loading ? '로그인 중...' : '로그인'}
      </button>
    </form>
  )
}
```

## 🚀 장점

1. **즉시 테스트**: 코드 변경 후 바로 확인
2. **단순한 구조**: AWS Cognito ↔ 프론트엔드
3. **비용 효율**: 람다 실행 비용 없음
4. **확장성**: Cognito의 다양한 기능 활용 가능

## 📋 TODO

1. AWS Cognito User Pool 생성
2. 프론트엔드에 AWS SDK 설치
3. 환경변수 설정 (Cognito Client ID)
4. 기존 람다 함수 제거

## 🔧 환경변수

```bash
# .env.local
NEXT_PUBLIC_COGNITO_CLIENT_ID=your_cognito_client_id
NEXT_PUBLIC_AWS_REGION=us-east-1
```

이제 람다 없이 프론트엔드에서 직접 인증을 처리합니다! 🎉