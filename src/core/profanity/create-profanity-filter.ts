import escapeStringRegexp from 'escape-string-regexp';
import { unique } from 'remeda';

import type { ProfanityOptions } from '../config';
import type { ProfanityFilter, ReplaceAllInput } from './profanity.types';

import { profanityOptionsSchema } from '../config/config.schema';
import { BAD_WORDS } from './profanity.constants';

// `\b` only knows ASCII letters, so Cyrillic and other scripts need explicit Unicode boundaries.
const BEFORE = '(?<![\\p{L}\\p{N}_])';
const AFTER = '(?![\\p{L}\\p{N}_])';

// Stands in for a removed word until the spacing around it is fixed.
const REMOVED = '\u0000';

export const createProfanityFilter = (options: ProfanityOptions = {}): ProfanityFilter => {
  const { additionalBlockWords, excludedWords, placeholder, overrideBlockWords } =
    profanityOptionsSchema.parse(options);
  const excluded = new Set(excludedWords.map((word) => word.toLowerCase()));

  const blockList = unique([...additionalBlockWords, ...(overrideBlockWords ? [] : BAD_WORDS)]).filter(
    (word) => !excluded.has(word.toLowerCase())
  );

  const patterns = blockList.map((word) => ({
    word,
    match: new RegExp(`${BEFORE}${escapeStringRegexp(word)}${AFTER}`, 'giu')
  }));

  const replaceAll = ({ input, replacement }: ReplaceAllInput) =>
    patterns.reduce((text, { match }) => text.replace(match, replacement), input);

  return {
    blockList,
    findProfaneWords: (input) => patterns.filter(({ match }) => input.search(match) !== -1).map(({ word }) => word),
    mask: (input) => replaceAll({ input, replacement: (found) => placeholder.repeat([...found].length) }),
    // Marks the words, then removes each run of marks with the spaces around it: one space stays between
    // two words, none at the end of a line or next to punctuation, and the indentation of a line is kept.
    clean: (input) =>
      replaceAll({ input, replacement: () => REMOVED }).replace(
        // A run of REMOVED marks (`\0`) with the spaces before and after it.
        /([ \t]*)\0(?:[ \t]*\0)*([ \t]*)/g,
        (_, before: string, after: string, offset: number, text: string) => {
          const atLineStart = offset === 0 || text[offset - 1] === '\n';

          if (atLineStart) {
            return before;
          }

          return before && after ? ' ' : '';
        }
      )
  };
};
