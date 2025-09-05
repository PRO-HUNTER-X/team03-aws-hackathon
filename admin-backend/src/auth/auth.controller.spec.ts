import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('로그인_성공시_JWT_토큰_반환', () => {
    it('올바른 인증정보로 로그인 성공', async () => {
      // Given
      const loginDto = { username: 'admin', password: 'admin123' };
      const expectedResult = {
        access_token: 'jwt.token.here',
        expires_in: 3600,
      };

      jest.spyOn(authService, 'login').mockResolvedValue(expectedResult);

      // When
      const result = await controller.login(loginDto);

      // Then
      expect(result).toEqual(expectedResult);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('잘못된_인증정보로_로그인_실패', () => {
    it('잘못된 비밀번호로 401 에러', async () => {
      // Given
      const loginDto = { username: 'admin', password: 'wrong_password' };

      jest.spyOn(authService, 'login').mockRejectedValue(
        new Error('인증에 실패했습니다')
      );

      // When & Then
      await expect(controller.login(loginDto)).rejects.toThrow(
        '인증에 실패했습니다'
      );
    });
  });
});