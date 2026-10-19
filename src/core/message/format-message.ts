import type { FormatMessageInput, RenderTemplateInput } from './message.types';

import { compileTemplate } from '../../shared/template';
import { wrapLine } from './message.utils';
import { prepareMessageData } from './prepare-message-data';

/** Renders the template, then cleans the result: no trailing spaces, at most one blank line in a row. */
export const renderTemplate = ({ template, data }: RenderTemplateInput): string =>
  compileTemplate(template)(data)
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\n+|\n+$/g, '');

/** Builds the commit message. The header stays on one line; body and footer lines are wrapped at `bodyLineLength`. */
export const formatMessage = (input: FormatMessageInput): string => {
  const [header = '', ...rest] = renderTemplate({
    template: input.config.template,
    data: prepareMessageData(input)
  }).split('\n');

  return [header.trim(), ...rest.flatMap((line) => wrapLine({ line, width: input.config.bodyLineLength }))].join('\n');
};

/**
 * Length of the header without the title (UTF-16 units, as commitlint counts):
 * what the title has left of `headerMaxLength`.
 */
export const headerPrefixLength = (input: FormatMessageInput): number => {
  // A one-character stand-in keeps the space before the title, which trimming would drop.
  const data = prepareMessageData({ ...input, data: { ...input.data, title: 'x' } });
  const [header = ''] = renderTemplate({ template: input.config.template, data }).split('\n');

  return header.trim().length - 1;
};
