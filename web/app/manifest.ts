import type { MetadataRoute } from 'next';

// PWA 매니페스트 — 폰 크롬 "홈 화면에 추가" 시 앱처럼(아이콘·전체화면·스플래시).
// 주제에 맞게 name/short_name/색만 교체. 아이콘은 web/public/icon-{192,512}.png.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '첫걸음 — 받은 행정문서, 쉬운 말과 첫 걸음으로',
    short_name: '첫걸음',
    description: '받은 행정 문서를 쉬운 말·기한·첫 걸음으로 안내합니다.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#256ef4',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
