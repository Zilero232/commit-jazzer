import { mapValues } from 'remeda';

import type { FormatMessageInput, SplitLinesInput, TemplateData } from './message.types';

import { normalizeTitle, splitIssues } from './message.utils';

// `a | b` reads as two lines `a` and `b`: one space around the break is part of the separator.
const splitLines = ({ text, separator }: SplitLinesInput) =>
  separator
    ? text
        .split(separator)
        .map((line, index) => (index === 0 ? line : line.replace(/^ /, '')).trimEnd())
        .join('\n')
    : text;

/** Turns the answers into the values the template sees, including the derived `scope`, `bang` and `issuePrefix`. */
export const prepareMessageData = ({ data, config }: FormatMessageInput): TemplateData => {
  // Body lines keep their indentation (lists, code); only the description as a whole is trimmed.
  const { description = '', comment = '', ...values } = mapValues(data, (value) => value ?? '');
  const short = mapValues(values, (value) => value.trim());
  const title = short.title ?? '';
  const issues = splitIssues(short.issues ?? '');

  return {
    ...short,
    description: splitLines({ text: description.trim(), separator: config.breaklineChar }),
    comment: comment.trim(),
    title: config.lowercaseTitle ? normalizeTitle(title) : title,
    issues: issues.join(', '),
    // GitHub closes only the issues a keyword stands in front of, so each issue gets its own line.
    issueFooter: issues.map((issue) => `${config.issuePrefix} ${issue}`).join('\n'),
    scope: short.component ? `(${short.component})` : '',
    bang: short.breaking ? '!' : '',
    issuePrefix: config.issuePrefix
  };
};
