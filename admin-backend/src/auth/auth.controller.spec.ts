import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

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

  describe('POST /auth/login', () => {
    it('올바른_인증정보로_로그인_성공', async () => {
      // Given
      const loginDto: LoginDto = { username: 'admin', password: 'admin123' };
      const expectedResult = {
        access_token: 'jwt.token.here',
        expires_in: 3600,
        redirect: {
          hasQnASetup: false,
          nextRoute: '/qna-setup',
          message: 'QnA 설정을 완료해주세요'
        }
      };

      jest.spyOn(authService, 'login').mockResolvedValue(expectedResult);

      // When
      const result = await controller.login(loginDto);

      // Then
      expect(result).toEqual(expectedResult);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });

    it('잘못된_인증정보로_UnauthorizedException_발생', async () => {
      // Given
      const loginDto: LoginDto = { username: 'admin', password: 'wrong_password' };

      jest.spyOn(authService, 'login').mockRejectedValue(
        new UnauthorizedException('인증에 실패했습니다')
      );

      // When & Then
      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException
      );
      await expect(controller.login(loginDto)).rejects.toThrow(
        '인증에 실패했습니다'
      );
    });
  });

  describe('POST /auth/verify', () => {
    it('유효한_토큰으로_검증_성공', () => {
      // Given
      const mockRequest = {
        user: { username: 'admin' }
      };

      // When
      const result = controller.verifyToken(mockRequest);

      // Then
      expect(result).toEqual({
        valid: true,
        user: { username: 'admin' }
      });
    });
  });

  describe('GET /auth/profile', () => {
    it('인증된_사용자_프로필_조회_성공', () => {
      // Given
      const mockRequest = {
        user: { username: 'admin', userId: 'admin' }
      };

      // When
      const result = controller.getProfile(mockRequest);

      // Then
      expect(result).toEqual({
        success: true,
        data: {
          username: 'admin',
          userId: 'admin'
        }
      });
    });
  });
});