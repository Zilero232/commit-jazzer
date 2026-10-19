import { describe, expect, it } from 'vitest';

import type { CommitField } from '../../../shared/constants';
import type { JazzerConfig } from '../../config';

import { resolvedConfig } from '../../../shared/testing/helpers';
import { getTranslations } from '../../i18n';
import { buildQuestions } from '../build-questions';

const translations = getTranslations('en');

const build = ({ config = {}, keys }: { config?: JazzerConfig; keys?: CommitField[] } = {}) =>
  buildQuestions({ config: resolvedConfig(config), translations, keys });

describe('buildQuestions', () => {
  it('asks the default questions in the built-in order', () => {
    expect(build().map(({ key }) => key)).toEqual(['type', 'component', 'title', 'description', 'breaking', 'issues']);
  });

  it('does not ask for answers the template never writes', () => {
    expect(build({ config: { template: '{{type}}: {{emoji}} - {{title}}' } }).map(({ key }) => key)).toEqual([
      'type',
      'title'
    ]);
  });

  it('keeps the built-in order whatever the order of availablePromptQuestions', () => {
    expect(build({ config: { availablePromptQuestions: ['title', 'type'] } }).map(({ key }) => key)).toEqual([
      'type',
      'title'
    ]);
  });

  it('takes the question text from the configured language', () => {
    const [, title] = buildQuestions({
      config: resolvedConfig({ language: 'ru', availablePromptQuestions: ['type', 'title'] }),
      translations: getTranslations('ru')
    });

    expect(title?.message).toBe(getTranslations('ru').questions.title);
  });

  it('applies question overrides', () => {
    const [question] = build({
      keys: ['title'],
      config: {
        baseQuestionsOptions: [
          {
            key: 'title',
            message: 'What changed?',
            options: { required: false, validations: { length: { minMessageLength: 5, maxMessageLength: 50 } } }
          }
        ]
      }
    });

    expect(question).toEqual({
      kind: 'text',
      key: 'title',
      message: 'What changed?',
      required: false,
      minLength: 5,
      maxLength: 50
    });
  });

  it('tells how to start a new line in the description', () => {
    const description = (breaklineChar: string) =>
      build({ keys: ['description'], config: { breaklineChar } })[0]?.message;

    expect(description('|')).toBe(`${translations.questions.description} ("|" starts a new line)`);
    expect(description('\\n')).toContain('"\\n" starts a new line');
    expect(description('')).toBe(translations.questions.description);
  });

  it('drops skipped questions, but builds them when asked for explicitly', () => {
    const config = { baseQuestionsOptions: [{ key: 'component' as const, options: { skip: true } }] };

    expect(build({ config }).map(({ key }) => key)).not.toContain('component');
    expect(build({ config, keys: ['component'] }).map(({ key }) => key)).toEqual(['component']);
  });

  it('offers the configured scopes in the component question', () => {
    const [question] = build({ keys: ['component'], config: { scopes: ['api'], allowCustomScopes: false } });

    expect(question).toMatchObject({ choices: { values: ['api'], allowCustom: false } });
  });

  it('gives the type question the resolved commit types', () => {
    const [question] = build({ keys: ['type'], config: { availableCommitTypes: ['fix'] } });

    expect(question?.kind === 'type' && question.commitTypes.map(({ name }) => name)).toEqual(['fix']);
  });
});

describe('buildQuestions types', () => {
  it('describes built-in types in the prompt language, keeping descriptions of the config', () => {
    const [question] = buildQuestions({
      config: resolvedConfig({
        language: 'ru',
        availableCommitTypes: ['feat', 'fix'],
        baseCommitTypes: { fix: { description: 'Своё описание' } },
        addCustomCommitTypes: { release: { emoji: '🔖', code: ':bookmark:', description: 'Release' } }
      }),
      translations: getTranslations('ru'),
      keys: ['type']
    });

    expect(question?.kind === 'type' && question.commitTypes.map(({ description }) => description)).toEqual([
      'Новая функциональность',
      'Своё описание',
      'Release'
    ]);
  });
});
