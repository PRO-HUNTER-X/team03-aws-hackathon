/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  distDir: 'out',
  // 동적 라우트 처리
  exportPathMap: async function () {
    return {
      '/': { page: '/' },
      '/inquiry': { page: '/inquiry' },
      '/demo': { page: '/demo' },
      '/status-demo': { page: '/status-demo' },
      '/status/demo': { page: '/status/[id]', query: { id: 'demo' } },
      '/status/sample': { page: '/status/[id]', query: { id: 'sample' } },
      '/status/test': { page: '/status/[id]', query: { id: 'test' } }
    };
  }
};

module.exports = nextConfig;