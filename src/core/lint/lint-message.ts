import type { LintIssue, LintMessageInput, StripCommentsInput } from './lint.types';

import { resolveCommitTypes } from '../commit-types';
import { FOOTER_LINE } from '../message';
import { HEADER, SKIPPED } from './lint.constants';

/**
 * Keeps what git will commit: drops the diff `git commit -v` adds under the scissors line, and the comment
 * lines git writes (the comment character followed by a space, or alone). `#WIP` is text, not a comment.
 */
export const stripComments = ({ message, commentChar = '#' }: StripCommentsInput): string => {
  const lines = message.replaceAll('\r\n', '\n').split('\n');
  const scissors = lines.indexOf(`${commentChar} ------------------------ >8 ------------------------`);

  return (scissors === -1 ? lines : lines.slice(0, scissors))
    .filter((line) => line !== commentChar && !line.startsWith(`${commentChar} `))
    .map((line) => line.trimEnd())
    .join('\n');
};

/**
 * Checks a finished commit message against the config: the header format, the type, the scope,
 * a non-empty subject, the length limits and the blank line after the header.
 * Merges, reverts, reapplies and fixups pass as they are.
 */
export const lintMessage = ({ message, config, commentChar }: LintMessageInput): LintIssue[] => {
  const [header = '', ...body] = stripComments({ message, commentChar }).trim().split('\n');

  if (SKIPPED.test(header)) {
    return [];
  }

  const match = HEADER.exec(header);

  if (!match?.groups) {
    return [{ rule: 'header', message: `The first line must look like "type(scope): subject", got "${header}"` }];
  }

  const { type = '', scope, subject = '' } = match.groups;
  const types = resolveCommitTypes(config).map(({ name }) => name);
  const issues: LintIssue[] = [];

  if (!types.includes(type)) {
    issues.push({ rule: 'type', message: `Unknown type "${type}". Use one of: ${types.join(', ')}` });
  }

  if (scope !== undefined && config.scopes.length > 0 && !config.allowCustomScopes && !config.scopes.includes(scope)) {
    issues.push({ rule: 'scope', message: `Unknown scope "${scope}". Use one of: ${config.scopes.join(', ')}` });
  }

  if (!subject.trim()) {
    issues.push({ rule: 'subject', message: 'The subject after ": " is empty' });
  }

  if (header.length > config.headerMaxLength) {
    issues.push({
      rule: 'header-length',
      message: `The first line has ${header.length} characters; at most ${config.headerMaxLength} are allowed`
    });
  }

  if (body.length > 0 && body[0] !== '') {
    issues.push({ rule: 'body-blank-line', message: 'Leave a blank line after the first line' });
  }

  if (config.bodyLineLength > 0) {
    body.forEach((line, index) => {
      if (line.length > config.bodyLineLength && !FOOTER_LINE.test(line) && !/^\S+$/.test(line.trim())) {
        issues.push({
          rule: 'body-length',
          message: `Line ${index + 2} has ${line.length} characters; at most ${config.bodyLineLength} are allowed`
        });
      }
    });
  }

  return issues;
};

/** Whether the template starts with the Conventional Commits header (`{{type}}…`), the format `lintMessage` checks. */
export const isConventionalTemplate = (template: string): boolean => /^\s*\{\{\s*type\s*\}\}/.test(template);
