import type input from '@inquirer/input';

import type { Translations } from '../../core/i18n';
import type { CommitAnswers } from '../../core/message';
import type { LimitLengthInput, Question, TextQuestion } from '../../core/questions';
import type { AskMode } from '../../core/run-policy';

/** Streams for the prompts; the git hook passes `/dev/tty`. */
export type PromptContext = Parameters<typeof input>[1];

export type AskQuestionsInput = {
  questions: Question[];
  translations: Translations;
  /** Which questions without an answer are asked; see `resolveRunPolicy`. */
  ask: AskMode;
  /** Answers given up front (CLI flags, an alias); their questions are not asked. */
  preset?: CommitAnswers;
  /** Suggested answers (from the branch name): defaults when asking, answers when not. */
  defaults?: CommitAnswers;
  /** Questions that are not asked but validate preset answers for them (limits from the config). */
  extraQuestions?: TextQuestion[];
  /** Limits the length of an answer given the answers so far; keeps the header within its limit. */
  limitLength?: (input: LimitLengthInput) => number | undefined;
  findProfaneWords?: (input: string) => string[];
  context?: PromptContext;
};

export type ConfirmMessageInput = {
  message: string;
  translations: Translations;
  context?: PromptContext;
};

export type AskSearchInput<Value> = {
  message: string;
  source: (term: string | undefined) => readonly { name: string; value: Value }[];
  validate?: (value: Value) => string | true;
  /** Preselected when the list first shows. */
  suggested?: Value;
  context?: PromptContext;
};

export type AskTextInput = {
  question: TextQuestion;
  maxLength?: number;
};

export type CheckAnswerInput = AskTextInput & {
  value: string;
};

export type CounterInput = {
  value: string;
  maxLength?: number;
};
