#!/bin/bash

echo "🐳 Admin Backend Docker 실행"
echo "="*40

# Docker 이미지 빌드
echo "📦 Docker 이미지 빌드 중..."
docker build -t admin-backend .

# 기존 컨테이너 정리
echo "🧹 기존 컨테이너 정리..."
docker stop admin-backend 2>/dev/null || true
docker rm admin-backend 2>/dev/null || true

# 컨테이너 실행
echo "🚀 컨테이너 실행 중..."
docker run -d \
  --name admin-backend \
  -p 3001:3000 \
  -e NODE_ENV=production \
  -e JWT_SECRET=cs-chatbot-secret-key \
  admin-backend

echo "✅ Admin Backend 실행 완료!"
echo "📍 접속 주소: http://localhost:3001"
echo "📋 API 문서: http://localhost:3001/api"
echo ""
echo "💡 유용한 명령어:"
echo "  docker logs admin-backend        # 로그 확인"
echo "  docker stop admin-backend        # 컨테이너 중지"
echo "  docker exec -it admin-backend sh # 컨테이너 접속"