import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/_tests/**/*.test.ts'],
    setupFiles: ['src/shared/testing/setup.ts'],
    unstubEnvs: true,
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      // CI fails when coverage drops below these.
      thresholds: { lines: 95, branches: 90, functions: 95, statements: 95 },
      include: ['src/**/*.ts'],
      exclude: ['src/**/_tests/**', 'src/shared/testing/**', 'src/**/*.types.ts', 'src/**/index.ts', 'src/bin.ts']
    }
  }
});
