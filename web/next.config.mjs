import { PHASE_PRODUCTION_BUILD } from 'next/constants.js';

/** @type {(phase: string) => import('next').NextConfig} */
export default (phase) => ({
  // build 는 .next-build, dev 는 .next 로 분리 → 동시 사용 시 충돌 없음.
  distDir: phase === PHASE_PRODUCTION_BUILD ? '.next-build' : '.next',
  // 배포(Vercel) 시 /api/guide 서버 함수에 카탈로그 데이터(web/data/catalog)를 함께 번들.
  // Next 14.2에선 experimental 아래.
  experimental: {
    outputFileTracingIncludes: {
      '/api/guide': ['./data/catalog/**'],
    },
  },
});
