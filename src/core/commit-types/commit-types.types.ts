import type { z } from 'zod';

import type { ResolvedConfig } from '../config';
import type { commitTypeSchema } from '../config/config.schema';

/** Emoji, shortcode and description of a commit type. */
type CommitTypeInfo = z.output<typeof commitTypeSchema>;

export type CommitType = CommitTypeInfo & {
  /** Type written into the commit message, e.g. `feat`. */
  name: string;
};

export type ResolveCommitTypesInput = Pick<
  ResolvedConfig,
  'addCustomCommitTypes' | 'availableCommitTypes' | 'baseCommitTypes'
>;
