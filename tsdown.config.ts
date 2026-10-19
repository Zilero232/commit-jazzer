import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: {
    index: './src/index.ts',
    cli: './src/bin.ts'
  },
  format: 'esm',
  platform: 'node',
  target: 'node22.13',
  // Small pure helpers are bundled: one file to load instead of a package per helper (~25 ms at startup).
  deps: {
    alwaysBundle: ['remeda', 'ts-pattern', 'escape-string-regexp']
  },
  dts: true,
  clean: true,
  publint: true
});
