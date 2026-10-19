import type { CommitAnswers } from '../core/message';
import type { createCommitCommand } from './create-program';

export type CommitOptions = {
  dryRun: boolean;
  retry: boolean;
  /** No confirmation; only required questions without a flag are asked. */
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

export type RunCliInput = {
  argv: readonly string[];
  cwd?: string;
};

export type CreateProgramInput = {
  cwd?: string;
  /** What came after `--`: arguments for `git commit`. */
  passthrough: string[];
  /** Receives the exit code of the command that ran. */
  exit: (code: number) => void;
};

/** The options of the root command, as commander parses them. */
type CommitFlags = ReturnType<ReturnType<typeof createCommitCommand>['opts']>;

export type ToCommitOptionsInput = {
  /** The positional argument: `:name`. */
  alias?: string;
  flags: CommitFlags;
  passthrough: string[];
  cwd?: string;
};

export type ReportInput = {
  error: unknown;
  /** The answers given as flags, to name the flag in an error about one. */
  preset?: CommitAnswers;
};
