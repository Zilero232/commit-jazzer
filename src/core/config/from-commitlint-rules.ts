import type { JazzerConfig } from './config.types';

import { BUILT_IN_COMMIT_TYPE_NAMES } from '../commit-types';

// A commitlint rule: [level, 'always' | 'never', value]. Level 0 is off.
const ruleValue = (rule: unknown): unknown => {
  if (!Array.isArray(rule) || rule[0] === 0 || rule[1] !== 'always') {
    return undefined;
  }

  return rule[2];
};

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');

const positiveInt = (value: unknown) => (Number.isInteger(value) && Number(value) > 0 ? Number(value) : undefined);

/**
 * Maps the commitlint rules commit-jazzer can follow to config values: `type-enum` → `availableCommitTypes`
 * (the built-in types it allows; custom types stay),
 * `scope-enum` → `scopes` (and no custom scopes when it is an error), `header-max-length` → `headerMaxLength`,
 * `body-max-line-length` → `bodyLineLength`.
 */
export const fromCommitlintRules = (rules: Record<string, unknown>): Partial<JazzerConfig> => {
  const scopeRule = rules['scope-enum'];
  const scopes = ruleValue(scopeRule);
  const typeEnum = ruleValue(rules['type-enum']);
  const types = isStringArray(typeEnum) ? BUILT_IN_COMMIT_TYPE_NAMES.filter((name) => typeEnum.includes(name)) : [];
  const headerMaxLength = positiveInt(ruleValue(rules['header-max-length']));
  const bodyLineLength = positiveInt(ruleValue(rules['body-max-line-length']));

  return {
    ...(types.length > 0 ? { availableCommitTypes: types } : {}),
    ...(isStringArray(scopes) && scopes.length > 0
      ? { scopes, allowCustomScopes: !(Array.isArray(scopeRule) && scopeRule[0] === 2) }
      : {}),
    ...(headerMaxLength ? { headerMaxLength } : {}),
    ...(bodyLineLength ? { bodyLineLength } : {})
  };
};
