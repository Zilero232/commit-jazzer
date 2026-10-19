import type { KnipConfig } from 'knip';

export default {
  entry: ['scripts/*.ts'],
  project: ['src/**/*.ts', 'scripts/**/*.ts'],
  ignoreDependencies: [
    // Loaded by semantic-release from release.config.js by name, not imported.
    '@semantic-release/.+',
    // Used by the .vue components of the docs site, which knip cannot parse.
    'vue'
  ]
} satisfies KnipConfig;
