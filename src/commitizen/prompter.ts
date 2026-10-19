import { exitCodeOf, reportError, reportResult, runJazzer } from '../app';

export type CommitizenCommit = (message: string) => void;

/**
 * Commitizen adapter entry point, used by `git cz`.
 *
 * Commitizen passes its own Inquirer 8 instance as the first argument. It is ignored:
 * the prompts run on the current `@inquirer` packages. The two positional parameters are Commitizen's API.
 */
export const prompter = async (_inquirer: unknown, commit: CommitizenCommit): Promise<void> => {
  try {
    const result = await runJazzer();
    const message = reportResult(result);

    if (message === undefined) {
      process.exitCode = exitCodeOf(result);

      return;
    }

    commit(message);
  } catch (error) {
    process.exitCode = reportError({ error });
  }
};
