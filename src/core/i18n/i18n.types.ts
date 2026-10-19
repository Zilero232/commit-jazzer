import type en from './locales/en.json';

// English is the reference: every other language must have the same keys.
export type Translations = typeof en;

export type InterpolateInput = {
  text: string;
  values: Record<string, number | string>;
};
