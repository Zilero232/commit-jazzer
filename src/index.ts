export { prompter } from './commitizen';
export { BUILT_IN_COMMIT_TYPE_NAMES } from './core/commit-types';
export { defineConfig } from './core/config';
export type { JazzerConfig } from './core/config';
/** @deprecated Use `JazzerConfig`. Kept for configs written for 1.x. */
export type { JazzerConfig as CommitJazzerPrompterOptions } from './core/config';
