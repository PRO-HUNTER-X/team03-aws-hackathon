import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // 간단한 인증 검증
    if (username !== 'admin' || password !== 'admin123') {
      return Response.json(
        { message: '인증에 실패했습니다' },
        { status: 401 }
      );
    }

    // JWT 토큰 생성 (간단한 예시)
    const payload = { username, sub: 'admin', role: 'admin' };
    const token = Buffer.from(JSON.stringify(payload)).toString('base64');

    // QnA 설정 여부 확인 (임시로 false)
    const hasQnAData = false;
    const nextRoute = hasQnAData ? '/dashboard' : '/qna-setup';

    return Response.json({
      access_token: `mock.${token}.signature`,
      expires_in: 3600,
      redirect: {
        hasQnASetup: hasQnAData,
        nextRoute: nextRoute,
        message: hasQnAData 
          ? '대시보드로 이동합니다' 
          : 'QnA 설정을 완료해주세요'
      }
    });
  } catch (error) {
    return Response.json(
      { message: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}