import { describe, expect, it } from 'vitest';

import { resolvedConfig } from '../../../shared/testing/helpers';
import { createMessage } from '../create-message';

const answers = { type: 'fix', emoji: '🐛', title: 'remove the evil hack' };
const badWords = { options: { additionalBlockWords: ['evil'], overrideBlockWords: true } };

describe('createMessage', () => {
  it('formats the answers', () => {
    expect(createMessage({ config: resolvedConfig({ validateCommitBadWords: false }), answers })).toMatchObject({
      status: 'ok',
      message: 'fix: 🐛 remove the evil hack'
    });
  });

  it('blocks a message with prohibited words', () => {
    expect(createMessage({ config: resolvedConfig({ badWordsOptions: badWords }), answers })).toEqual({
      status: 'blocked',
      profaneWords: ['evil'],
      reason: 'The message contains prohibited words: evil. Please remove them.'
    });
  });

  it('explains the block in the configured language', () => {
    const result = createMessage({ config: resolvedConfig({ language: 'ru', badWordsOptions: badWords }), answers });

    expect(result.status === 'blocked' && result.reason).toContain('запрещённые слова: evil');
  });

  it('masks prohibited words when asked to', () => {
    const config = resolvedConfig({
      badWordsOptions: { ...badWords, checkHasProfaneWords: false, replaceProfaneWords: true }
    });

    expect(createMessage({ config, answers })).toMatchObject({ message: 'fix: 🐛 remove the **** hack' });
  });

  it('removes prohibited words when asked to', () => {
    const config = resolvedConfig({
      badWordsOptions: { ...badWords, checkHasProfaneWords: false, clearMessage: true }
    });

    expect(createMessage({ config, answers })).toMatchObject({ message: 'fix: 🐛 remove the hack' });
  });

  it('removes rather than masks when both are on', () => {
    const config = resolvedConfig({
      badWordsOptions: { ...badWords, checkHasProfaneWords: false, replaceProfaneWords: true, clearMessage: true }
    });

    expect(createMessage({ config, answers })).toMatchObject({ message: 'fix: 🐛 remove the hack' });
  });

  it('removes words from the answers, so no empty scope is left', () => {
    const config = resolvedConfig({
      badWordsOptions: { ...badWords, checkHasProfaneWords: false, clearMessage: true }
    });

    expect(createMessage({ config, answers: { ...answers, component: 'evil' } })).toMatchObject({
      message: 'fix: 🐛 remove the hack'
    });
  });

  it('blocks a message whose title is nothing but removed words', () => {
    const config = resolvedConfig({
      badWordsOptions: { ...badWords, checkHasProfaneWords: false, clearMessage: true }
    });

    expect(createMessage({ config, answers: { ...answers, title: 'evil' } })).toMatchObject({
      status: 'blocked',
      profaneWords: ['evil']
    });
  });

  it('checks a given message instead of formatting the answers', () => {
    const config = resolvedConfig({ badWordsOptions: badWords });

    expect(createMessage({ config, answers, message: 'chore: tidy up' })).toMatchObject({ message: 'chore: tidy up' });
  });
});
