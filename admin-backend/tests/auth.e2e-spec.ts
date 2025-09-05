import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Auth E2E Tests', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /auth/login', () => {
    it('올바른_인증정보로_로그인_성공', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'admin',
          password: 'admin123'
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('expires_in', 3600);
          expect(typeof res.body.access_token).toBe('string');
        });
    });

    it('잘못된_사용자명으로_401_에러', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'wrong_user',
          password: 'admin123'
        })
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toBe('인증에 실패했습니다');
        });
    });

    it('잘못된_비밀번호로_401_에러', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'admin',
          password: 'wrong_password'
        })
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toBe('인증에 실패했습니다');
        });
    });

    it('빈_요청_본문으로_400_에러', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({})
        .expect(400);
    });
  });

  describe('POST /auth/verify', () => {
    let accessToken: string;

    beforeEach(async () => {
      // 먼저 로그인해서 토큰 획득
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'admin',
          password: 'admin123'
        });
      
      accessToken = loginResponse.body.access_token;
    });

    it('유효한_토큰으로_검증_성공', () => {
      return request(app.getHttpServer())
        .post('/auth/verify')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(201)
        .expect((res) => {
          expect(res.body).toEqual({
            valid: true,
            user: { username: 'admin' }
          });
        });
    });

    it('토큰_없이_요청시_401_에러', () => {
      return request(app.getHttpServer())
        .post('/auth/verify')
        .expect(401);
    });

    it('잘못된_토큰으로_401_에러', () => {
      return request(app.getHttpServer())
        .post('/auth/verify')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(401);
    });
  });

  describe('GET /auth/profile', () => {
    let accessToken: string;

    beforeEach(async () => {
      // 먼저 로그인해서 토큰 획득
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'admin',
          password: 'admin123'
        });
      
      accessToken = loginResponse.body.access_token;
    });

    it('인증된_사용자_프로필_조회_성공', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            success: true,
            data: {
              username: 'admin',
              userId: 'admin'
            }
          });
        });
    });

    it('토큰_없이_요청시_401_에러', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .expect(401);
    });
  });
});