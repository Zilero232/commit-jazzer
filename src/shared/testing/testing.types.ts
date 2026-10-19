export type TempDir = { path: string; remove: () => Promise<void> };

export type TempRepo = TempDir & { git: (...args: string[]) => string };

export type RunGitInput = {
  cwd: string;
  args: string[];
};
