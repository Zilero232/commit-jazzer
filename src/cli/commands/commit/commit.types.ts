export type IsPathspecInput = {
  arg: string;
  cwd: string;
};

export type StageCheckInput = {
  gitArgs: readonly string[];
  cwd?: string;
};

/** The message to commit, or the exit code when there is none. */
export type ResolvedMessage = {
  message?: string;
  code: number;
};
