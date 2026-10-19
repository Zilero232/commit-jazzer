import { describe, expect, it } from 'vitest';

import type { ResolveRunPolicyInput } from '../run-policy.types';

import { resolveRunPolicy } from '../resolve-run-policy';

const config = { confirmCommit: true, inferFromBranch: true, showBanner: true };

describe('resolveRunPolicy', () => {
  it.each<[string, Omit<ResolveRunPolicyInput, 'config'>, ReturnType<typeof resolveRunPolicy>]>([
    [
      'asks everything in a terminal',
      { interactive: true },
      { ask: 'all', confirm: true, banner: true, useBranch: true }
    ],
    [
      'asks only required questions with --yes',
      { interactive: true, yes: true },
      { ask: 'required', confirm: false, banner: false, useBranch: true }
    ],
    [
      'treats an alias like --yes',
      { interactive: true, alias: true },
      { ask: 'required', confirm: false, banner: false, useBranch: true }
    ],
    [
      'lets the caller turn the confirmation back on',
      { interactive: true, alias: true, confirm: true },
      { ask: 'required', confirm: true, banner: false, useBranch: true }
    ],
    [
      'asks, shows and guesses nothing without a terminal',
      { interactive: false, confirm: true, showBanner: true },
      { ask: 'none', confirm: false, banner: false, useBranch: false }
    ]
  ])('%s', (_, input, expected) => {
    expect(resolveRunPolicy({ config, ...input })).toEqual(expected);
  });

  it('follows the config when the caller says nothing', () => {
    expect(
      resolveRunPolicy({
        config: { confirmCommit: false, inferFromBranch: false, showBanner: false },
        interactive: true
      })
    ).toEqual({
      ask: 'all',
      confirm: false,
      banner: false,
      useBranch: false
    });
  });
});
