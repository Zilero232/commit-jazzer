import type { UserConfig } from '@commitlint/types';

import { BUILT_IN_COMMIT_TYPE_NAMES } from './src/core/commit-types';

// The repo's own commits are made with commit-jazzer, so any of its types is allowed. The emoji sits right after
// the colon and starts the subject, which subject-case cannot judge; the tool lower-cases titles itself.
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'subject-case': [0],
    'type-enum': [2, 'always', [...BUILT_IN_COMMIT_TYPE_NAMES]]
  }
} satisfies UserConfig;
