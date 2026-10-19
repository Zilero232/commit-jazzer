import { describe, expect, it } from 'vitest';

import { DEFAULT_COMMIT_TYPES } from '../../commit-types';
import { inferFromBranch } from '../infer-from-branch';

const commitTypes = [...DEFAULT_COMMIT_TYPES];

describe('inferFromBranch', () => {
  it.each([
    ['feat/PROJ-12-login', { type: 'feat', issues: 'PROJ-12' }],
    ['fix/42-crash-on-start', { type: 'fix', issues: '42' }],
    ['docs/readme', { type: 'docs' }],
    ['PROJ-7-hotfix', { issues: 'PROJ-7' }],
    ['42-quick', { issues: '42' }],
    ['feature/login', { type: 'feat' }],
    ['bugfix/PROJ-8-null', { type: 'fix', issues: 'PROJ-8' }],
    ['chore/node-20-upgrade', { type: 'chore' }],
    ['feat/2024-01-cleanup', { type: 'feat' }],
    ['main', {}],
    ['release/v2', {}]
  ])('reads %s', (branch, expected) => {
    expect(inferFromBranch({ branch, commitTypes })).toEqual(expected);
  });
});
