import Fuse from 'fuse.js';
import { unique } from 'remeda';

import type { CommitType } from '../commit-types';
import type { CommitTypeChoice, ToChoiceInput } from './questions.types';

const toChoice = ({ type, nameWidth }: ToChoiceInput): CommitTypeChoice => ({
  name: `${type.emoji}  ${type.name.padEnd(nameWidth)}  ${type.description}`,
  value: type,
  short: `${type.emoji} ${type.name}`
});

/**
 * Creates the `source` of the type search: every type for an empty term; otherwise the types whose name
 * starts with the term (in list order, so `f` gives `feat` and `fix` first), then fuzzy matches on
 * name, description and emoji code.
 */
export const createCommitTypeSearch = (commitTypes: CommitType[]) => {
  const fuse = new Fuse(commitTypes, {
    keys: [
      { name: 'name', weight: 3 },
      { name: 'description', weight: 1 },
      { name: 'code', weight: 1 }
    ],
    threshold: 0.4,
    ignoreLocation: true
  });

  const nameWidth = Math.max(0, ...commitTypes.map(({ name }) => name.length));

  return (term = ''): CommitTypeChoice[] => {
    const query = term.trim().toLowerCase();

    if (!query) {
      return commitTypes.map((type) => toChoice({ type, nameWidth }));
    }

    const byPrefix = commitTypes.filter(({ name }) => name.toLowerCase().startsWith(query));
    const fuzzy = fuse.search(query).map(({ item }) => item);

    return unique([...byPrefix, ...fuzzy]).map((type) => toChoice({ type, nameWidth }));
  };
};
