import { Controller, Post, Body, Get, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: '관리자 로그인' })
  @ApiResponse({ status: 200, description: '로그인 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify')
  @ApiBearerAuth()
  @ApiOperation({ summary: '토큰 검증' })
  @ApiResponse({ status: 200, description: '토큰 검증 성공' })
  @ApiResponse({ status: 401, description: '토큰 검증 실패' })
  verifyToken(@Request() req) {
    return {
      valid: true,
      user: {
        username: req.user.username
      }
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: '프로필 조회' })
  @ApiResponse({ status: 200, description: '프로필 조회 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  getProfile(@Request() req) {
    return {
      success: true,
      data: {
        username: req.user.username,
        userId: req.user.userId
      }
    };
  }

  @Get('health')
  health() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('test-db')
  async testDb() {
    try {
      const result = await this.authService.testDynamoDB();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Get('initial-route')
  @ApiOperation({ summary: '로그인 후 초기 라우팅 정보 조회' })
  @ApiResponse({ status: 200, description: '초기 라우팅 정보 조회 성공' })
  async getInitialRoute(@Query('companyId') companyId: string) {
    const routeInfo = await this.authService.getInitialRoute(companyId);
    return {
      success: true,
      data: routeInfo
    };
  }
}