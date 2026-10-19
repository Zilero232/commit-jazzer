import type { KnipConfig } from 'knip';

export default {
  entry: ['scripts/*.ts'],
  project: ['src/**/*.ts', 'scripts/**/*.ts']
} satisfies KnipConfig;
