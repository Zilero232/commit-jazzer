import { describe, expect, it } from 'vitest';

import { resolvedConfig } from '../../../shared/testing/helpers';
import { DEFAULT_COMMIT_TYPES } from '../commit-types.constants';
import { resolveCommitTypes } from '../resolve-commit-types';

describe('resolveCommitTypes', () => {
  it('offers every built-in type by default', () => {
    expect(resolveCommitTypes(resolvedConfig())).toHaveLength(DEFAULT_COMMIT_TYPES.length);
  });

  it('keeps only the available types, in built-in order', () => {
    const types = resolveCommitTypes(resolvedConfig({ availableCommitTypes: ['fix', 'feat'] }));

    expect(types.map(({ name }) => name)).toEqual(['feat', 'fix']);
  });

  it('applies overrides to built-in types', () => {
    const [feat] = resolveCommitTypes(
      resolvedConfig({ availableCommitTypes: ['feat'], baseCommitTypes: { feat: { emoji: '🎸' } } })
    );

    expect(feat).toEqual({ name: 'feat', emoji: '🎸', code: ':sparkles:', description: 'Introducing new features' });
  });

  it('appends custom types even when the built-in list is filtered', () => {
    const types = resolveCommitTypes(
      resolvedConfig({
        availableCommitTypes: ['fix'],
        addCustomCommitTypes: { release: { emoji: '🔖', code: ':bookmark:', description: 'Release' } }
      })
    );

    expect(types.map(({ name }) => name)).toEqual(['fix', 'release']);
  });

  it('lets a custom type replace the built-in type of the same name', () => {
    const types = resolveCommitTypes(
      resolvedConfig({
        addCustomCommitTypes: { fix: { emoji: '🩹', code: ':adhesive_bandage:', description: 'Patch' } }
      })
    );

    expect(types.filter(({ name }) => name === 'fix')).toEqual([
      { name: 'fix', emoji: '🩹', code: ':adhesive_bandage:', description: 'Patch' }
    ]);
  });
});

describe('DEFAULT_COMMIT_TYPES', () => {
  it('has unique names and emoji codes', () => {
    const names = DEFAULT_COMMIT_TYPES.map(({ name }) => name);
    const codes = DEFAULT_COMMIT_TYPES.map(({ code }) => code);

    expect(new Set(names).size).toBe(names.length);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('includes every Conventional Commits type', () => {
    const names = new Set<string>(DEFAULT_COMMIT_TYPES.map(({ name }) => name));

    ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'ci', 'chore', 'revert'].forEach((type) => {
      expect(names.has(type), type).toBe(true);
    });
  });
});
