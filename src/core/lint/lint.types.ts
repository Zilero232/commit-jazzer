import type { ResolvedConfig } from '../config';

export type LintIssue = {
  /** Which check failed, e.g. `type` or `header-length`. */
  rule: 'body-blank-line' | 'body-length' | 'header-length' | 'header' | 'scope' | 'subject' | 'type';
  message: string;
};

export type LintMessageInput = {
  /** The message file as git hands it to commit-msg: comment lines and a `git commit -v` diff are ignored. */
  message: string;
  config: ResolvedConfig;
  /** git's `core.commentChar`; `#` by default. */
  commentChar?: string;
};

export type StripCommentsInput = {
  message: string;
  commentChar?: string;
};
