import type { CommitField } from '../../shared/constants';
import type { AnswerErrorInput } from './questions.types';

/**
 * An answer that cannot be used: missing without a terminal to ask in, invalid, or an unknown type.
 * The entry points phrase it for their users: the CLI names the flag, an alias names itself.
 */
export class AnswerError extends Error {
  override name = 'AnswerError';
  readonly code: AnswerErrorInput['code'];
  readonly field: CommitField;
  readonly reason: string;

  constructor({ code, field, reason }: AnswerErrorInput) {
    super(`${field}: ${reason}`);
    this.code = code;
    this.field = field;
    this.reason = reason;
  }
}
