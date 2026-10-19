import type { ResolvedConfig } from '../config';

/** Which questions without an answer are asked: all, only required ones, or none (an error if required). */
export type AskMode = 'all' | 'none' | 'required';

export type RunPolicy = {
  ask: AskMode;
  confirm: boolean;
  banner: boolean;
  /** Suggest answers from the branch name. */
  useBranch: boolean;
};

export type ResolveRunPolicyInput = {
  config: Pick<ResolvedConfig, 'confirmCommit' | 'inferFromBranch' | 'showBanner'>;
  /** Whether there is a terminal to ask in. */
  interactive: boolean;
  /** `--yes`: no confirmation, optional questions without an answer stay empty. */
  yes?: boolean;
  /** An alias is used: same as `yes`. */
  alias?: boolean;
  /** Explicit `confirm`/`showBanner` from the caller; they win over everything but a missing terminal. */
  confirm?: boolean;
  showBanner?: boolean;
};
