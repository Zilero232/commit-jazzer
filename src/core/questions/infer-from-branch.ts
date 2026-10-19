import type { CommitAnswers } from '../message';
import type { InferFromBranchInput } from './questions.types';

import { BRANCH_TYPE_ALIASES } from './questions.constants';

// A tracker key at the start of a branch segment, written in capitals as trackers do: `PROJ-123`.
// Lower case is left alone: `node-20-upgrade` or `utf-8` are not issues.
const TRACKER_KEY = /(?:^|\/)([A-Z][A-Z\d]+-\d+)(?=[-_/]|$)/;
// An issue number right after the prefix, followed by words: `fix/42-crash`, not `feat/2024-01-cleanup`.
const ISSUE_NUMBER = /^(?:[\w-]+\/)?(\d+)(?:[-_](?=[a-z])|$)/i;

/**
 * Guesses answers from a branch name such as `feat/PROJ-12-login` or `fix/42-crash`:
 * the type from the prefix (a known type, or `feature`, `bugfix`, `hotfix`, …) and the issue key or number.
 */
export const inferFromBranch = ({ branch, commitTypes }: InferFromBranchInput): CommitAnswers => {
  const prefix = branch.includes('/') ? (branch.split('/', 1)[0] ?? '').toLowerCase() : '';
  const wanted = BRANCH_TYPE_ALIASES[prefix] ?? prefix;
  const type = commitTypes.find(({ name }) => name === wanted)?.name;
  const issue = TRACKER_KEY.exec(branch)?.[1] ?? ISSUE_NUMBER.exec(branch)?.[1];

  return {
    ...(type ? { type } : {}),
    ...(issue ? { issues: issue } : {})
  };
};
