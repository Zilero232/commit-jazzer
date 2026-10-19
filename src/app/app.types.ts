import type { ResolvedConfig } from '../core/config';
import type { CommitAnswers, CreateMessageResult, MessageData } from '../core/message';
import type { AnswerError } from '../core/questions';
import type { LoadConfigInput } from '../io/config-loader';
import type { PromptContext } from '../io/prompts';

export type RunJazzerInput = LoadConfigInput & {
  /** Overrides `showBanner` from the config. */
  showBanner?: boolean;
  /** Overrides `confirmCommit` from the config. */
  confirm?: boolean;
  /** Answers given up front; their questions are skipped. */
  preset?: CommitAnswers;
  /** Name of an alias from the config: its answers, without questions or confirmation. */
  alias?: string;
  /** `--yes`: no confirmation, optional questions without an answer stay empty. */
  yes?: boolean;
  /** Whether questions can be asked. Default: whether the input is a terminal. */
  interactive?: boolean;
  /** Streams for the prompts. */
  context?: PromptContext;
};

export type RunJazzerResult =
  | Extract<CreateMessageResult, { status: 'blocked' }>
  | { status: 'cancelled'; /** Ctrl+C rather than "Cancel" in the confirmation. */ interrupted: boolean }
  | { status: 'ok'; message: string; answers: MessageData; config: ResolvedConfig };

export type ReportErrorInput = {
  error: unknown;
  /** Phrases an answer error for the entry point's users, e.g. with the CLI flag that gave the answer. */
  describe?: (error: AnswerError) => string;
};
