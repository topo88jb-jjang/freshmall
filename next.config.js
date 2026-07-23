/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  experimental: {
    serverActions: {
      // 사진 업로드가 Server Action(POST)으로 처리되는데, Next.js 기본 제한(1MB)보다
      // 큰 사진(스마트폰 사진은 보통 3~10MB)도 올릴 수 있도록 늘려둡니다.
      bodySizeLimit: '10mb',
    },
  },
};
module.exports = nextConfig;
