import type { CommitField } from '../shared/constants';

// The flag that answers each question, for errors about answers.
export const FIELD_FLAGS = {
  type: 'type',
  component: 'scope',
  title: 'title',
  description: 'body',
  breaking: 'breaking',
  issues: 'issues',
  comment: 'comment'
} as const satisfies Record<CommitField, string>;

export const HELP_FOOTER = `
Options of git commit go after "--": jazzer -- -S --author "Jane <jane@example.com>" src/a.ts
Without a terminal (CI, scripts) nothing is asked and nothing is guessed from the branch:
give the required answers (type and title) as flags.

Examples:
  jazzer
  jazzer -t fix -s parser -m "handle empty input" -y
  jazzer :deps
  jazzer -n -t docs -m "fix typos"`;
