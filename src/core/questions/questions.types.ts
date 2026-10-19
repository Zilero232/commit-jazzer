import type { CommitField } from '../../shared/constants';
import type { CommitType } from '../commit-types';
import type { ResolvedConfig } from '../config';
import type { Translations } from '../i18n';
import type { CommitAnswers } from '../message';

type TextField = Exclude<CommitField, 'type'>;

type TypeQuestion = {
  kind: 'type';
  key: 'type';
  message: string;
  commitTypes: CommitType[];
};

export type TextQuestion = {
  kind: 'text';
  key: TextField;
  message: string;
  required: boolean;
  minLength: number;
  maxLength?: number;
  /** A list to pick from with autocompletion (scopes). */
  choices?: { values: string[]; allowCustom: boolean };
};

export type Question = TextQuestion | TypeQuestion;

export type FieldDefaults = { required: boolean; maxLength?: number };

export type BuildQuestionsInput = {
  config: ResolvedConfig;
  translations: Translations;
  /** Questions to build; defaults to `availablePromptQuestions`, without the skipped ones. */
  keys?: readonly CommitField[];
};

type ValidationMessages = Translations['validation'] & Pick<Translations['messages'], 'prohibitedWords'>;

export type ValidateAnswerInput = {
  value: string;
  question: TextQuestion;
  messages: ValidationMessages;
  /** Overrides `question.maxLength`, e.g. with what the header has left. */
  maxLength?: number;
  findProfaneWords?: (input: string) => string[];
};

export type CommitTypeChoice = {
  name: string;
  value: CommitType;
  short: string;
};

export type ChoiceSearchInput = {
  choices: NonNullable<TextQuestion['choices']>;
  required: boolean;
  labels: { none: string; custom: (value: string) => string };
};

export type LengthLimitInput = {
  config: ResolvedConfig;
  questions: Question[];
};

export type LimitLengthInput = {
  question: TextQuestion;
  answers: CommitAnswers;
};

export type InferFromBranchInput = {
  branch: string;
  commitTypes: CommitType[];
};

export type ChoiceOption = { name: string; value: string };

export type AnswerErrorInput = {
  code: 'invalid' | 'missing' | 'unknown-type';
  field: CommitField;
  /** Why, in the configured language for invalid answers. */
  reason: string;
};

export type ToChoiceInput = {
  type: CommitType;
  nameWidth: number;
};

export type LocalizeTypesInput = Omit<BuildQuestionsInput, 'keys'>;
