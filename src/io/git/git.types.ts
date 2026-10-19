export type GitInput = {
  cwd?: string;
};

export type GitCommitInput = GitInput & {
  /** File with the message, passed as `git commit -F`. */
  messageFile: string;
  /** Extra arguments for `git commit`, e.g. `--amend` or `--no-verify`. */
  args?: readonly string[];
};

export type SaveLastMessageInput = GitInput & {
  message: string;
};

export type RunGitInput = GitInput & {
  args: readonly string[];
};

export type GitPathInput = GitInput & {
  path: string;
};

export type GitConfigInput = GitInput & {
  key: string;
};
