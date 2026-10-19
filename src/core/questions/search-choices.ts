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

    const options: ChoiceOption[] = matches.map((value) => ({ name: value, value }));

    if (choices.allowCustom && isNew) {
      options.push({ name: labels.custom(query), value: query });
    }

    if (!required) {
      options.push({ name: labels.none, value: '' });
    }

    return options;
  };
