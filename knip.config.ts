import type { KnipConfig } from 'knip';

export default {
  entry: ['scripts/*.ts'],
  project: ['src/**/*.ts', 'scripts/**/*.ts'],
  // The site lives in site/, not where the VitePress plugin looks by default.
  vitepress: { config: ['site/.vitepress/config.ts', 'site/.vitepress/theme/index.ts'] }
} satisfies KnipConfig;
