import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json(
        { message: '토큰이 제공되지 않았습니다' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    // 간단한 토큰 검증 (실제로는 JWT 라이브러리 사용)
    if (token.startsWith('mock.')) {
      return Response.json({
        valid: true,
        user: {
          username: 'admin'
        }
      });
    }

    return Response.json(
      { message: '유효하지 않은 토큰입니다' },
      { status: 401 }
    );
  } catch (error) {
    return Response.json(
      { message: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}