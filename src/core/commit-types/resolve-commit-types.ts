import type { CommitType, ResolveCommitTypesInput } from './commit-types.types';

import { DEFAULT_COMMIT_TYPES } from './commit-types.constants';

/**
 * Builds the list of commit types to offer: the available built-in types with their overrides applied,
 * followed by the custom types. A custom type with a built-in name replaces the built-in one.
 */
export const resolveCommitTypes = ({
  availableCommitTypes,
  baseCommitTypes,
  addCustomCommitTypes
}: ResolveCommitTypesInput): CommitType[] => {
  const customNames = new Set(Object.keys(addCustomCommitTypes));

  const builtIn = DEFAULT_COMMIT_TYPES.filter(
    ({ name }) => (availableCommitTypes.length === 0 || availableCommitTypes.includes(name)) && !customNames.has(name)
  ).map((type) => ({ ...type, ...baseCommitTypes[type.name] }));

  const custom = Object.entries(addCustomCommitTypes).map(([name, type]) => ({ name, ...type }));

  return [...builtIn, ...custom];
};
