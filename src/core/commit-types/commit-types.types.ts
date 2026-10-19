import type { z } from 'zod';

import type { ResolvedConfig } from '../config';
import type { commitTypeSchema } from '../config/config.schema';
import type { DEFAULT_COMMIT_TYPES } from './commit-types.constants';

/** Emoji, shortcode and description of a commit type. */
export type CommitTypeInfo = z.output<typeof commitTypeSchema>;

export type CommitType = CommitTypeInfo & {
  /** Type written into the commit message, e.g. `feat`. */
  name: string;
};

export type BuiltInCommitTypeName = (typeof DEFAULT_COMMIT_TYPES)[number]['name'];

export type ResolveCommitTypesInput = Pick<
  ResolvedConfig,
  'addCustomCommitTypes' | 'availableCommitTypes' | 'baseCommitTypes'
>;
