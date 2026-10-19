import { describe, expect, it } from 'vitest';

import { DEFAULT_PROMPT_QUESTIONS, DEFAULT_TEMPLATE } from '../config.constants';
import { ConfigError, parseConfig } from '../parse-config';

describe('parseConfig', () => {
  it('fills every default for an empty config', () => {
    const config = parseConfig({ config: {} });

    expect(config.language).toBe('en');
    expect(config.template).toBe(DEFAULT_TEMPLATE);
    expect(config.availablePromptQuestions).toEqual(DEFAULT_PROMPT_QUESTIONS);
    expect(config.showBanner).toBe(false);
    expect(config.badWordsOptions).toEqual({
      checkHasProfaneWords: true,
      replaceProfaneWords: false,
      clearMessage: false,
      options: { additionalBlockWords: [], excludedWords: [], placeholder: '*', overrideBlockWords: false }
    });
  });

  it('treats a missing config as an empty one', () => {
    expect(parseConfig({ config: undefined })).toEqual(parseConfig({ config: {} }));
  });

  it('fills nested defaults around the fields that are set', () => {
    const config = parseConfig({ config: { showBannerOptions: { options: { color: 'red' } } } });

    expect(config.showBannerOptions.options.color).toBe('red');
    expect(config.showBannerOptions.options.separatorColor).toBe('gray');
    expect(config.showBannerOptions.figletOptions.font).toBe('Standard');
  });

  it('accepts the $schema key of JSON configs', () => {
    expect(() => parseConfig({ config: { $schema: './node_modules/commit-jazzer/schema.json' } })).not.toThrow();
  });

  it('rejects unknown keys, so typos do not pass silently', () => {
    expect(() => parseConfig({ config: { languge: 'ru' } })).toThrow(ConfigError);
  });

  it('names the source and the field in the error', () => {
    expect(() => parseConfig({ config: { language: 'xx' }, source: 'jazzer.config.json' })).toThrow(
      /Invalid jazzer\.config\.json[\s\S]*language/
    );
  });

  it.each([
    ['an unknown built-in commit type', { availableCommitTypes: ['feature'] }, /availableCommitTypes/],
    ['a style util.styleText does not know', { showBannerOptions: { options: { color: 'pink' } } }, /color/],
    ['a figlet font that does not exist', { showBannerOptions: { figletOptions: { font: 'Comic Sans' } } }, /font/],
    ['an alias without a title', { aliases: { deps: { type: 'upgrade' } } }, /title/],
    [
      'a skipped title',
      { baseQuestionsOptions: [{ key: 'title', options: { skip: true } }] },
      /"title" cannot be skipped/
    ],
    ['an optional type', { baseQuestionsOptions: [{ key: 'type', options: { required: false } }] }, /"type" cannot be/],
    ['an alias name with spaces', { aliases: { 'my deps': { type: 'upgrade', title: 'x' } } }, /aliases/],
    [
      'an alias with a type that is not offered',
      { availableCommitTypes: ['feat'], aliases: { deps: { type: 'upgrade', title: 'x' } } },
      /"upgrade" is not an available commit type/
    ],
    [
      'an alias with a scope outside a closed list',
      { scopes: ['api'], allowCustomScopes: false, aliases: { deps: { type: 'fix', component: 'deps', title: 'x' } } },
      /"deps" is not in scopes/
    ],
    [
      'a custom type with "-"',
      { addCustomCommitTypes: { 'hot-fix': { emoji: '🚑', code: ':ambulance:', description: 'x' } } },
      /"hot-fix": use letters, digits or "_"/
    ],
    ['questions without the title', { availablePromptQuestions: ['type'] }, /Must include "type" and "title"/]
  ])('rejects %s', (_, config, error) => {
    expect(() => parseConfig({ config })).toThrow(error);
  });
});
