import { beforeEach, describe, expect, it, vi } from 'vitest';

import { loadConfig } from '../../io/config-loader';
import { getCurrentBranch } from '../../io/git';
import { askQuestions, confirmMessage } from '../../io/prompts';
import { resolvedConfig } from '../../shared/testing/helpers';
import { runJazzer } from '../run-jazzer';

vi.mock('../../io/config-loader', () => ({ loadConfig: vi.fn() }));
vi.mock('../../io/git', () => ({ getCurrentBranch: vi.fn() }));
vi.mock('../../io/prompts', async (original) => ({
  ...(await original<object>()),
  askQuestions: vi.fn(),
  confirmMessage: vi.fn()
}));

const answers = { type: 'feat', emoji: '✨', title: 'add login' };
const askInput = () => vi.mocked(askQuestions).mock.calls.at(-1)?.[0];
const abort = () => Object.assign(new Error('closed'), { name: 'ExitPromptError' });

describe('runJazzer', () => {
  beforeEach(() => {
    vi.mocked(loadConfig).mockResolvedValue({
      config: resolvedConfig({ aliases: { deps: { type: 'upgrade', title: 'bump deps' } } })
    });
    vi.mocked(getCurrentBranch).mockResolvedValue('fix/PROJ-9-crash');
    vi.mocked(askQuestions).mockResolvedValue(answers);
    vi.mocked(confirmMessage).mockImplementation(async ({ message }) => message);
  });

  it('asks, confirms and returns the message', async () => {
    expect(await runJazzer({ interactive: true })).toMatchObject({ status: 'ok', message: 'feat: ✨ add login' });
    expect(askInput()?.ask).toBe('all');
    expect(confirmMessage).toHaveBeenCalledOnce();
  });

  it('asks nothing, confirms nothing and reads no branch without a terminal', async () => {
    await runJazzer({ interactive: false });

    expect(askInput()).toMatchObject({ ask: 'none', defaults: {} });
    expect(getCurrentBranch).not.toHaveBeenCalled();
    expect(confirmMessage).not.toHaveBeenCalled();
  });

  it('asks only required questions and skips the confirmation with yes', async () => {
    await runJazzer({ interactive: true, yes: true });

    expect(askInput()?.ask).toBe('required');
    expect(confirmMessage).not.toHaveBeenCalled();
  });

  it('reports "Cancel" and Ctrl+C as cancelled, telling them apart', async () => {
    vi.mocked(confirmMessage).mockResolvedValueOnce(null);

    expect(await runJazzer({ interactive: true })).toEqual({ status: 'cancelled', interrupted: false });

    vi.mocked(askQuestions).mockRejectedValueOnce(abort());

    expect(await runJazzer({ interactive: true })).toEqual({ status: 'cancelled', interrupted: true });
  });

  it('refuses an answer the template would drop', async () => {
    vi.mocked(loadConfig).mockResolvedValue({
      config: resolvedConfig({ template: '{{type}}: {{emoji}} - {{title}}' })
    });

    await expect(runJazzer({ interactive: true, preset: { breaking: 'gone' } })).rejects.toMatchObject({
      field: 'breaking',
      reason: 'the template has no {{breaking}}, so this answer would be lost'
    });
  });

  it('sends an edited message back to the confirmation until it is valid', async () => {
    vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
    vi.mocked(confirmMessage)
      .mockResolvedValueOnce('garbage message')
      .mockResolvedValueOnce('fix: 🐛 better\n# a comment');

    // The first edit fails the lint and goes back to the confirmation; the second passes, without its comment.
    expect(await runJazzer({ interactive: true })).toMatchObject({ status: 'ok', message: 'fix: 🐛 better' });
    expect(confirmMessage).toHaveBeenCalledTimes(2);
  });

  it('runs the profanity filter on an edited message', async () => {
    vi.mocked(confirmMessage).mockResolvedValueOnce('feat: ✨ add bullshit');

    expect(await runJazzer({ interactive: true })).toMatchObject({ status: 'blocked', profaneWords: ['bullshit'] });
  });

  it('suggests answers from the branch name', async () => {
    await runJazzer({ interactive: true });

    expect(askInput()?.defaults).toEqual({ type: 'fix', issues: 'PROJ-9' });
  });

  it('commits an alias without confirmation, flags on top', async () => {
    await runJazzer({ interactive: true, alias: 'deps', preset: { issues: '3' } });

    expect(askInput()).toMatchObject({ ask: 'required', preset: { type: 'upgrade', title: 'bump deps', issues: '3' } });
    expect(confirmMessage).not.toHaveBeenCalled();
  });

  it.each(['nope', 'constructor', 'toString'])('rejects the unknown alias ":%s"', async (alias) => {
    await expect(runJazzer({ alias })).rejects.toThrow(`Unknown alias ":${alias}". Known: :deps`);
  });

  it('names the alias in an error about its answers', async () => {
    const { AnswerError } = await import('../../core/questions');

    vi.mocked(askQuestions).mockRejectedValueOnce(
      new AnswerError({ code: 'invalid', field: 'title', reason: 'Too long' })
    );

    await expect(runJazzer({ interactive: true, alias: 'deps' })).rejects.toMatchObject({
      reason: 'Too long (in alias :deps)'
    });
  });

  it('does not blame the alias for an answer it did not give', async () => {
    const { AnswerError } = await import('../../core/questions');

    // The alias has no issues; this one came from the branch name.
    vi.mocked(askQuestions).mockRejectedValueOnce(
      new AnswerError({ code: 'invalid', field: 'issues', reason: 'Too long' })
    );

    await expect(runJazzer({ interactive: true, alias: 'deps' })).rejects.toMatchObject({ reason: 'Too long' });
  });

  it('cancels when the edited message is left empty', async () => {
    vi.mocked(loadConfig).mockResolvedValueOnce({ config: resolvedConfig({ template: '{{title}}' }) });
    vi.mocked(confirmMessage).mockResolvedValueOnce('# only a comment');

    expect(await runJazzer({ interactive: true })).toEqual({ status: 'cancelled', interrupted: false });
  });

  it('gives the questions a profanity check and the questions that are not asked', async () => {
    await runJazzer({ interactive: true });

    expect(askInput()?.findProfaneWords?.('bullshit')).toEqual(['bullshit']);
    expect(askInput()?.extraQuestions?.map(({ key }) => key)).toEqual([
      'component',
      'title',
      'description',
      'breaking',
      'issues',
      'comment'
    ]);
  });
});
