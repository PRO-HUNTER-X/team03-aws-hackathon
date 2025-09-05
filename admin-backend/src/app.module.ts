import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { SetupModule } from './setup/setup.module';

@Module({
  imports: [AuthModule, SetupModule],
})
export class AppModule {}