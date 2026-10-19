import { isDefined } from 'remeda';
import stringWidth from 'string-width';
import wrapAnsi from 'wrap-ansi';

import type { WrapLineInput } from './message.types';

import { FOOTER_LINE } from './message.constants';

/**
 * Lower-cases the first letter unless the word is an acronym (`API`), and drops a trailing period.
 * A title that would end up empty (`...`) is kept as typed.
 */
export const normalizeTitle = (title: string): string => {
  const [first = '', second = ''] = title;
  const isAcronym = second !== '' && second === second.toUpperCase() && second !== second.toLowerCase();
  const normalized = `${isAcronym ? first : first.toLowerCase()}${title.slice(first.length)}`.replace(/\.+$/, '');

  return normalized || title;
};

// Footer keywords people type out of habit, with or without a colon; the configured `issuePrefix` replaces them.
const ISSUE_KEYWORDS = /^(?:close[ds]?|fix(?:e[ds])?|resolve[ds]?|refs?|see):?$/i;

/** `closes 12, #13 JIRA-1` → `['#12', '#13', 'JIRA-1']`: bare numbers become GitHub references. */
export const splitIssues = (issues: string): string[] =>
  issues
    .split(/[\s,]+/)
    .filter((issue) => issue !== '' && !ISSUE_KEYWORDS.test(issue))
    .map((issue) => (/^\d+$/.test(issue) ? `#${issue}` : issue));

/**
 * Wraps a body line at word boundaries, keeping its indentation; a word longer than the width (a URL) stays whole.
 * Footer lines are left alone, and no wrapped line starts with `#`: git would drop it as a comment.
 */
export const wrapLine = ({ line, width }: WrapLineInput): string[] => {
  const indent = /^\s*/.exec(line)?.[0] ?? '';

  if (width <= 0 || stringWidth(line) <= width || FOOTER_LINE.test(line) || indent.length >= width) {
    return [line];
  }

  const parts = wrapAnsi(line.slice(indent.length), width - indent.length, { hard: false, trim: true }).split('\n');
  const lines: string[] = [];

  for (const part of parts) {
    const previous = lines.at(-1);

    // git would drop a line starting with "#" as a comment, so such a part never starts a line.
    if (!isDefined(previous) || !part.startsWith('#')) {
      lines.push(`${indent}${part}`);
      continue;
    }

    const cut = previous.lastIndexOf(' ');

    // The last word of the line above moves down with it; a line of one word takes the part instead.
    if (cut > indent.length) {
      lines[lines.length - 1] = previous.slice(0, cut);
      lines.push(`${indent}${previous.slice(cut + 1)} ${part}`);
    } else {
      lines[lines.length - 1] = `${previous} ${part}`;
    }
  }

  return lines;
};
