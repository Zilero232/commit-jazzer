import type { CommitField } from '../../shared/constants';

// Conventional Commits header with the emoji after the colon, so commitlint and semantic-release still parse it.
export const DEFAULT_TEMPLATE = `{{type}}{{scope}}{{bang}}: {{emoji}} {{title}}

{{description}}

{{comment}}

{{#if breaking}}BREAKING CHANGE: {{breaking}}{{/if}}
{{issueFooter}}`;

export const DEFAULT_PROMPT_QUESTIONS: CommitField[] = [
  'type',
  'component',
  'title',
  'description',
  'breaking',
  'issues'
];

export const DEFAULT_BANNER_TEXT = 'Commit Jazzer';

export const FIGLET_LAYOUTS = ['default', 'full', 'fitted', 'controlled smushing', 'universal smushing'] as const;
