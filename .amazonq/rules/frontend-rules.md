# 프론트엔드 코딩 규칙

## 컴포넌트 패턴
```typescript
interface Props {
  // 타입 정의 필수
}

export function ComponentName({ prop1, prop2 }: Props) {
  // Zustand 스토어 사용
  const { data, loading, fetchData } = useStore()
  
  // React Hook Form 사용
  const { register, handleSubmit, formState: { errors } } = useForm()
  
  return (
    <div className="container mx-auto p-4">
      {/* Tailwind CSS 클래스 사용 */}
    </div>
  )
}
```

## API 호출 패턴
```typescript
// lib/api.ts
import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 인터셉터로 토큰 자동 추가
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

## Zustand 스토어 패턴
```typescript
interface StoreState {
  data: DataType[]
  loading: boolean
  error: string | null
  fetchData: () => Promise<void>
}

export const useStore = create<StoreState>((set, get) => ({
  data: [],
  loading: false,
  error: null,
  fetchData: async () => {
    set({ loading: true, error: null })
    try {
      const response = await api.get('/endpoint')
      set({ data: response.data, loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  }
}))
```

## 네이밍 규칙
- 컴포넌트: `PascalCase`
- 함수/변수: `camelCase`
- 파일: `PascalCase.tsx` (컴포넌트), `camelCase.ts` (유틸)

## 필수 사항
- TypeScript 타입 정의 필수
- shadcn/ui 컴포넌트 우선 사용
- Tailwind CSS 클래스 사용
- 에러 바운더리 적용

## 코드 품질 규칙
- **EOF (End of File)**: 모든 파일은 마지막에 빈 줄로 끝나야 함
- **불필요한 import 제거**: 사용하지 않는 import문은 반드시 제거
- **불필요한 코드 제거**: 주석 처리된 코드, 사용하지 않는 함수/변수 제거
- **불필요한 파일 제거**: 더 이상 사용하지 않는 파일은 삭제
- **작업 파일만 적용**: 수정하는 파일에만 위 규칙을 적용하여 불필요한 변경 최소화
