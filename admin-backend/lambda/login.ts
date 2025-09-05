import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'cs-chatbot-secret-key';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          error: { message: '요청 본문이 필요합니다' }
        })
      };
    }

    const { username, password } = JSON.parse(event.body);

    if (!username || !password) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          error: { message: '사용자명과 비밀번호는 필수입니다' }
        })
      };
    }

    if (username !== 'admin' || password !== 'admin123') {
      return {
        statusCode: 401,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          error: { message: '인증에 실패했습니다' }
        })
      };
    }

    const payload = { username, sub: 'admin' };
    const access_token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        data: { access_token, expires_in: 3600 }
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: { message: '서버 오류가 발생했습니다' }
      })
    };
  }
};