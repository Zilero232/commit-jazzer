import type { CommitField } from '../../shared/constants';
import type { FieldDefaults } from './questions.types';

// The title also has to fit what `headerMaxLength` leaves after the type and scope; 70 keeps it readable in `git log`.
export const FIELD_DEFAULTS: Record<CommitField, FieldDefaults> = {
  type: { required: true },
  component: { required: false, maxLength: 30 },
  title: { required: true, maxLength: 70 },
  description: { required: false },
  breaking: { required: false },
  issues: { required: false, maxLength: 100 },
  comment: { required: false }
};

export const SEARCH_PAGE_SIZE = 12;

// Branch prefixes people use for a type of another name.
export const BRANCH_TYPE_ALIASES: Partial<Record<string, string>> = {
  feature: 'feat',
  features: 'feat',
  bugfix: 'fix',
  hotfix: 'fix',
  doc: 'docs',
  refactoring: 'refactor',
  tests: 'test'
};

// Fields that may span several lines: the body paragraphs.
export const MULTI_LINE_FIELDS: ReadonlySet<CommitField> = new Set(['description', 'comment']);
