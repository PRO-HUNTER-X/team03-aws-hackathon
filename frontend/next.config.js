/** @type {import('next').NextConfig} */
const nextConfig = {
  // 개발 환경에서는 정적 빌드 비활성화
  // output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
};

module.exports = nextConfig;