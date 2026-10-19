import type { parseArgs } from 'node:util';

import type { CommitAnswers } from '../../core/message';

export type CommitOptions = {
  dryRun: boolean;
  retry: boolean;
  /** No confirmation; optional questions without a flag stay empty. */
  yes: boolean;
  banner?: boolean;
  configPath?: string;
  preset: CommitAnswers;
  /** `jazzer :name`: an alias from the config. */
  alias?: string;
  /** Arguments passed on to `git commit`. */
  gitArgs: string[];
  cwd?: string;
};

export type InitOptions = {
  ts: boolean;
  hook: boolean;
  /** Also install a commit-msg hook that lints messages written without commit-jazzer. */
  lint: boolean;
  removeHook: boolean;
  force: boolean;
  cwd?: string;
};

export type HookOptions = {
  file: string;
  source?: string;
  configPath?: string;
};

export type LintOptions = {
  /** Message file; `.git/COMMIT_EDITMSG` by default. */
  file?: string;
  configPath?: string;
  cwd?: string;
};

export type CliCommand =
  | { name: 'commit'; options: CommitOptions }
  | { name: 'help' }
  | { name: 'hook'; options: HookOptions }
  | { name: 'init'; options: InitOptions }
  | { name: 'lint'; options: LintOptions }
  | { name: 'version' };

export type ParseOptions = NonNullable<Parameters<typeof parseArgs>[0]>['options'];

export type ParseInput<Options extends ParseOptions> = {
  args: string[];
  options: Options;
};

export type RunCliInput = {
  argv: readonly string[];
  cwd?: string;
};
