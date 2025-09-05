import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('로그인_성공_테스트', () => {
    it('올바른_인증정보로_JWT_토큰_반환', async () => {
      // Given
      const loginDto: LoginDto = {
        username: 'admin',
        password: 'admin123',
      };
      const mockToken = 'mock.jwt.token';

      jest.spyOn(jwtService, 'sign').mockReturnValue(mockToken);

      // When
      const result = await service.login(loginDto);

      // Then
      expect(result).toEqual({
        access_token: mockToken,
        expires_in: 3600,
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        username: 'admin',
        sub: 'admin',
      });
    });
  });

  describe('로그인_실패_테스트', () => {
    it('잘못된_사용자명으로_UnauthorizedException_발생', async () => {
      // Given
      const loginDto: LoginDto = {
        username: 'wrong_user',
        password: 'admin123',
      };

      // When & Then
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        '인증에 실패했습니다'
      );
    });

    it('잘못된_비밀번호로_UnauthorizedException_발생', async () => {
      // Given
      const loginDto: LoginDto = {
        username: 'admin',
        password: 'wrong_password',
      };

      // When & Then
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        '인증에 실패했습니다'
      );
    });

    it('빈_사용자명으로_UnauthorizedException_발생', async () => {
      // Given
      const loginDto: LoginDto = {
        username: '',
        password: 'admin123',
      };

      // When & Then
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException
      );
    });

    it('빈_비밀번호로_UnauthorizedException_발생', async () => {
      // Given
      const loginDto: LoginDto = {
        username: 'admin',
        password: '',
      };

      // When & Then
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException
      );
    });
  });
});