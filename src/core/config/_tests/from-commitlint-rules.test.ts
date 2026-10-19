import { describe, expect, it } from 'vitest';

import { fromCommitlintRules } from '../from-commitlint-rules';

describe('fromCommitlintRules', () => {
  it('takes the scopes, and forbids others when scope-enum is an error', () => {
    expect(fromCommitlintRules({ 'scope-enum': [2, 'always', ['api', 'web']] })).toEqual({
      scopes: ['api', 'web'],
      allowCustomScopes: false
    });
  });

  it('keeps custom scopes allowed when scope-enum is only a warning', () => {
    expect(fromCommitlintRules({ 'scope-enum': [1, 'always', ['api']] })).toMatchObject({ allowCustomScopes: true });
  });

  it('offers only the built-in types type-enum allows', () => {
    expect(fromCommitlintRules({ 'type-enum': [2, 'always', ['feat', 'fix', 'wip']] })).toEqual({
      availableCommitTypes: ['feat', 'fix']
    });
    expect(fromCommitlintRules({ 'type-enum': [2, 'always', ['wip']] })).toEqual({});
  });

  it('takes the length limits', () => {
    expect(
      fromCommitlintRules({ 'header-max-length': [2, 'always', 72], 'body-max-line-length': [2, 'always', 80] })
    ).toEqual({
      headerMaxLength: 72,
      bodyLineLength: 80
    });
  });

  it.each([
    ['rules that are off', { 'scope-enum': [0, 'always', ['api']], 'header-max-length': [0, 'always', 72] }],
    ['"never" rules', { 'scope-enum': [2, 'never', ['api']] }],
    ['an empty scope list', { 'scope-enum': [2, 'always', []] }],
    ['values of the wrong type', { 'header-max-length': [2, 'always', 'long'], 'scope-enum': [2, 'always', [1]] }],
    ['no rules', {}]
  ])('ignores %s', (_, rules) => {
    expect(fromCommitlintRules(rules)).toEqual({});
  });
});
