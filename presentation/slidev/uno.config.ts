import { createExternalPackageIconLoader } from '@iconify/utils/lib/loader/external-pkg'
// @ts-expect-error - Ignoring the error of missing types for the uno config
import config from '@slidev/client/uno.config'
import { mergeConfigs, presetAttributify, presetIcons, presetWebFonts, presetWind3 } from 'unocss'

// Engine ported from BaizeAI/talks (Apache-2.0). See presentation/sources/ASSET_LICENSES.md
export default mergeConfigs([
  config,
  {
    rules: [
      ['font-math', { 'font-family': 'Latin Modern Roman, ui-serif, Georgia, Cambria, "Times New Roman", Times, serif' }],
    ],
    safelist: [
      // keep delay-100 .. delay-3000 for staggered v-click reveals
      ...Array.from({ length: 30 }, (_, i) => `delay-${(i + 1) * 100}`),
      'animate-pulse',
    ],
    presets: [
      presetWind3({
        dark: 'class',
      }),
      presetAttributify(),
      presetIcons({
        prefix: 'i-',
        extraProperties: {
          'display': 'inline-block',
          'vertical-align': 'middle',
        },
        warn: true,
        collections: {
          ...createExternalPackageIconLoader('@proj-airi/lobe-icons'),
        },
      }),
      presetWebFonts({
        // CDN (Google Fonts) at build time; falls back to system fonts if blocked.
        fonts: {
          sans: ['DM Sans', 'Noto Sans KR'],
          kr: 'Noto Sans KR',
          hand: 'Playwrite IT Moderna',
        },
      }),
    ],
  },
])
