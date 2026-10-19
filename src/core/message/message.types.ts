import type { CommitField } from '../../shared/constants';
import type { ResolvedConfig } from '../config';

export type CommitAnswers = Partial<Record<CommitField, string>>;

export type MessageData = CommitAnswers & {
  emoji?: string;
  code?: string;
};

type MessageConfig = Pick<
  ResolvedConfig,
  'bodyLineLength' | 'breaklineChar' | 'issuePrefix' | 'lowercaseTitle' | 'template'
>;

export type TemplateData = Record<string, string>;

export type FormatMessageInput = {
  data: MessageData;
  config: MessageConfig;
};

export type RenderTemplateInput = {
  template: string;
  data: TemplateData;
};

export type SplitLinesInput = {
  text: string;
  /** The break-line character; empty keeps the text as it is. */
  separator: string;
};

export type WrapLineInput = {
  line: string;
  /** Columns; `0` keeps the line whole. */
  width: number;
};

export type CreateMessageInput = {
  config: ResolvedConfig;
  answers: MessageData;
  /** A message to check instead of formatting the answers, e.g. one edited by hand. */
  message?: string;
};

export type CreateMessageResult =
  { status: 'blocked'; profaneWords: string[]; reason: string } | { status: 'ok'; message: string };
