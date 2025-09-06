import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { SetupService } from '../setup/setup.service';
import { CompanyService } from '../company/company.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly setupService: SetupService,
    private readonly companyService: CompanyService
  ) {}

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    // 공통 관리자 계정 검증 (모든 회사에서 사용 가능)
    if (username !== 'admin' || password !== 'admin123') {
      throw new UnauthorizedException('인증에 실패했습니다');
    }

    const payload = { username, sub: 'admin', role: 'admin' };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      expires_in: 3600,
      user: {
        username,
        role: 'admin'
      }
    };
  }

  async testDynamoDB() {
    // 직접 AWS CLI로 확인된 데이터 조회 테스트
    const result = await this.companyService.getCompanyById('hunters-company');
    return result;
  }

  async getInitialRoute(companyId: string) {
    const company = await this.companyService.getCompanyById(companyId);
    const qnaData = await this.setupService.getQnADataByCompany(companyId);
    
    return {
      hasQnAData: qnaData.length > 0,
      companyInfo: company,
      redirectTo: qnaData.length > 0 ? '/dashboard' : '/setup',
      qnaCount: qnaData.length
    };
  }
}