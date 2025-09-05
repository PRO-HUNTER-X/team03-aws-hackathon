import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: '관리자 사용자명', example: 'admin' })
  @IsString()
  @IsNotEmpty({ message: '사용자명은 필수입니다' })
  username: string;

  @ApiProperty({ description: '관리자 비밀번호', example: 'admin123' })
  @IsString()
  @IsNotEmpty({ message: '비밀번호는 필수입니다' })
  password: string;
}