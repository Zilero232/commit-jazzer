import type { ChoiceOption, ChoiceSearchInput } from './questions.types';

/**
 * Creates the `source` of a pick-or-type question (scopes): matching values first,
 * then the typed text as a custom value (when allowed), then "none" (when the answer is optional).
 */
export const createChoiceSearch =
  ({ choices, required, labels }: ChoiceSearchInput) =>
  (term = ''): ChoiceOption[] => {
    const query = term.trim();
    const lower = query.toLowerCase();
    const matches = choices.values.filter((value) => value.toLowerCase().includes(lower));
    const isNew = query !== '' && !choices.values.includes(query);

    return [
      ...matches.map((value) => ({ name: value, value })),
      ...(choices.allowCustom && isNew ? [{ name: labels.custom(query), value: query }] : []),
      ...(required ? [] : [{ name: labels.none, value: '' }])
    ];
  };
