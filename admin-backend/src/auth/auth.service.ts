import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly adminCredentials = {
    username: 'admin',
    password: '$2b$10$K8BQC.zJQGWqJvPMfOw8KeO4o4QfQfQfQfQfQfQfQfQfQfQfQfQfQ' // admin123 해시
  };

  constructor(private readonly jwtService: JwtService) {}

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    if (username !== this.adminCredentials.username) {
      throw new UnauthorizedException('인증에 실패했습니다');
    }

    // 개발용 간단 비교 (실제로는 bcrypt 사용)
    if (password !== 'admin123') {
      throw new UnauthorizedException('인증에 실패했습니다');
    }

    const payload = { username, sub: 'admin' };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      expires_in: 3600,
    };
  }
}