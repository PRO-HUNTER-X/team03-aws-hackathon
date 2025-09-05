import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { SetupService } from '../setup/setup.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly setupService: SetupService
  ) {}

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    // 간단한 인증 검증
    if (username !== 'admin' || password !== 'admin123') {
      throw new UnauthorizedException('인증에 실패했습니다');
    }

    const payload = { username, sub: 'admin', role: 'admin' };
    const access_token = this.jwtService.sign(payload);

    // QnA 설정 여부 확인
    const hasQnAData = this.setupService.hasQnAData();
    const nextRoute = hasQnAData ? '/dashboard' : '/qna-setup';

    return {
      access_token,
      expires_in: 3600,
      redirect: {
        hasQnASetup: hasQnAData,
        nextRoute: nextRoute,
        message: hasQnAData 
          ? '대시보드로 이동합니다' 
          : 'QnA 설정을 완료해주세요'
      }
    };
  }
}