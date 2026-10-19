import type { CommitField } from '../../shared/constants';

import { COMMIT_FIELDS } from '../../shared/constants';

// Template variables that carry a field: `{{scope}}` is the component, `{{bang}}` the breaking change, and so on.
const FIELD_VARIABLES: Record<CommitField, readonly string[]> = {
  type: ['type'],
  component: ['component', 'scope'],
  title: ['title'],
  description: ['description'],
  breaking: ['breaking', 'bang'],
  issues: ['issues', 'issueFooter'],
  comment: ['comment']
};

/** The fields a template writes into the message: `{{type}}: {{title}}` writes only those two. */
export const templateFields = (template: string): Set<CommitField> => {
  const variables = new Set([...template.matchAll(/\{\{[#/^]?\s*(?:if\s+|unless\s+)?(\w+)/g)].map(([, name]) => name));
  return new Set(COMMIT_FIELDS.filter((field) => FIELD_VARIABLES[field].some((name) => variables.has(name))));
};
