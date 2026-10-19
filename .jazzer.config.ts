// The config commit-jazzer uses for its own commits: `bun run commit`.
import { defineConfig } from './src';

export default defineConfig({
  scopes: [
    'cli',
    'config',
    'prompt',
    'message',
    'profanity',
    'banner',
    'i18n',
    'commitizen',
    'deps',
    'release',
    'docs'
  ],
  availableCommitTypes: [
    'feat',
    'fix',
    'refactor',
    'perf',
    'chore',
    'docs',
    'test',
    'build',
    'ci',
    'upgrade',
    'remove',
    'revert'
  ],
  aliases: {
    deps: { type: 'upgrade', component: 'deps', title: 'update dependencies' }
  }
});
