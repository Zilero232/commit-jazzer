import { describe, expect, it } from 'vitest';

import { CliArgsError, parseCliArgs } from '../args/parse-cli-args';

const commit = (argv: string[]) => {
  const command = parseCliArgs(argv);

  if (command.name !== 'commit') {
    throw new Error(`expected the commit command, got ${command.name}`);
  }

  return command.options;
};

describe('parseCliArgs', () => {
  it('keeps answer values as strings, including numbers and empty ones', () => {
    expect(commit(['-i', '007', '-m', '2024', '--breaking', '', '-s', '0x10']).preset).toEqual({
      issues: '007',
      title: '2024',
      breaking: '',
      component: '0x10'
    });
  });

  it('maps every answer flag to its field and leaves out the ones not given', () => {
    expect(commit(['-t', 'fix', '-b', 'body', '--comment', 'c']).preset).toEqual({
      type: 'fix',
      description: 'body',
      comment: 'c'
    });
  });

  it('reads the options of the commit command', () => {
    expect(commit(['-n', '-y', '-r', '-c', 'cfg.json', '--no-banner'])).toMatchObject({
      dryRun: true,
      yes: true,
      retry: true,
      configPath: 'cfg.json',
      banner: false
    });
    expect(commit([]).banner).toBeUndefined();
  });

  it('passes git flags and everything after "--" to git commit, in order', () => {
    expect(
      commit(['-a', '--amend', '--no-verify', '--', '-S', '--author', 'Jane <j@e.com>', 'src/a.ts']).gitArgs
    ).toEqual(['--all', '--amend', '--no-verify', '-S', '--author', 'Jane <j@e.com>', 'src/a.ts']);
  });

  it('reads an alias from ":name" or --alias', () => {
    expect(commit([':deps', '-n']).alias).toBe('deps');
    expect(commit(['--alias', 'deps']).alias).toBe('deps');
  });

  it('accepts a value starting with "-" in the --name=value form', () => {
    expect(commit(['--title=-fix the flag']).preset.title).toBe('-fix the flag');
  });

  it.each([
    [['innit'], /Unknown command "innit"/],
    [['--yes', 'init'], /Put the command first: jazzer init/],
    [['--typo'], /Unknown option --typo. Options of git commit go after "--": jazzer -- --typo/],
    [[':deps', 'extra'], /Unknown command "extra"/],
    [['-t'], /argument missing/],
    [['-m', '-fix'], /--title="-x"/],
    [['-b', '-x'], /--body="-x"/],
    [[':deps', '--alias', 'other'], /Give the alias once/],
    [['--retry', '-t', 'feat'], /--retry commits the saved message as it is/],
    [['lint', 'a', 'b'], /lint takes one message file/],
    [['init', 'now'], /Unexpected argument "now"/],
    [['hook'], /hook needs the message file/]
  ])('rejects %j', (argv, error) => {
    expect(() => parseCliArgs(argv)).toThrow(CliArgsError);
    expect(() => parseCliArgs(argv)).toThrow(error);
  });

  it('reads the init and hook commands', () => {
    expect(parseCliArgs(['init', '--ts', '--hook', '--lint', '-f'])).toEqual({
      name: 'init',
      options: { ts: true, hook: true, lint: true, removeHook: false, force: true }
    });
    expect(parseCliArgs(['lint', 'MSG', '-c', 'x.json'])).toEqual({
      name: 'lint',
      options: { file: 'MSG', configPath: 'x.json' }
    });
    expect(parseCliArgs(['init', '--remove-hook'])).toMatchObject({ options: { removeHook: true } });
    expect(parseCliArgs(['hook', '.git/COMMIT_EDITMSG', 'message', '-c', 'x.json'])).toEqual({
      name: 'hook',
      options: { file: '.git/COMMIT_EDITMSG', source: 'message', configPath: 'x.json' }
    });
  });

  it('reads help and version', () => {
    expect(parseCliArgs(['-h'])).toEqual({ name: 'help' });
    expect(parseCliArgs(['init', '--help'])).toEqual({ name: 'help' });
    expect(parseCliArgs(['--version'])).toEqual({ name: 'version' });
    expect(parseCliArgs(['init', '-v'])).toEqual({ name: 'version' });
    expect(parseCliArgs(['hook', '-v'])).toEqual({ name: 'version' });
  });
});
