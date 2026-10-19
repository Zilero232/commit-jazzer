/** Inquirer rejects with `ExitPromptError` on Ctrl+C. */
export const isPromptAbort = (error: unknown): boolean => error instanceof Error && error.name === 'ExitPromptError';
