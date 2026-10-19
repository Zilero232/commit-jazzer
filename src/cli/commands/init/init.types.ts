import type { HookName } from './init.constants';

export type InitContext = {
  /** Root of the repository, or the working directory outside one. */
  root: string;
  /** Whether the root is a git repository. */
  inRepository: boolean;
};

export type HookInput = InitContext & {
  name: HookName;
};

export type WriteConfigInput = InitContext & {
  ts: boolean;
};

export type HookScriptInput = {
  /** What the hook does, for the comment in it. */
  purpose: string;
  /** Arguments for commit-jazzer. */
  command: string;
};
