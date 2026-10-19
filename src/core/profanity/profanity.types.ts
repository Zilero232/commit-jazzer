import type { ProfanityOptions } from '../config';

export type ProfanityFilterOptions = ProfanityOptions;

export type ProfanityFilter = {
  /** Blocked words found in the input, in list order, each listed once. */
  findProfaneWords: (input: string) => string[];
  /** Replaces every character of a blocked word with the placeholder. */
  mask: (input: string) => string;
  /** Removes blocked words together with one space next to each. */
  clean: (input: string) => string;
  /** The effective block list. */
  blockList: readonly string[];
};
