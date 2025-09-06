import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  app.enableCors({
    origin: true, // 모든 origin 허용 (개발용)
    credentials: true,
  });

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('CS 챗봇 관리자 인증 API')
    .setDescription('관리자 로그인 및 토큰 검증 API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 관리자 인증 서버가 포트 ${port}에서 실행 중입니다`);
  console.log(`📖 API 문서: http://localhost:${port}/api-docs`);
}

bootstrap();