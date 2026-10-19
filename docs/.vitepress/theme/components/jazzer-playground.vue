<script setup lang="ts">
import { computed, reactive, ref } from 'vue';

import { DEFAULT_COMMIT_TYPES } from '../../../../src/core/commit-types/commit-types.constants';
// Deep imports on purpose: the indexes also pull in node:util, which a browser lacks.
import { formatMessage } from '../../../../src/core/message/format-message';
import { LANGUAGES, SCHEMA_URL } from '../../../../src/shared/constants';
import schema from '../../../public/commit-jazzer-schema.json';

// The defaults of the package, read from its JSON Schema; only differences end up in the generated config.
const { properties } = schema;

const DEFAULTS = {
  language: properties.language.default,
  template: properties.template.default,
  issuePrefix: properties.issuePrefix.default,
  lowercaseTitle: properties.lowercaseTitle.default,
  headerMaxLength: properties.headerMaxLength.default,
  bodyLineLength: properties.bodyLineLength.default,
  breaklineChar: properties.breaklineChar.default,
  showBanner: properties.showBanner.default,
  confirmCommit: properties.confirmCommit.default
};

const SETTING_KEYS = [
  'language',
  'template',
  'issuePrefix',
  'lowercaseTitle',
  'headerMaxLength',
  'bodyLineLength',
  'breaklineChar',
  'showBanner',
  'confirmCommit'
] as const satisfies readonly (keyof typeof DEFAULTS)[];

const answers = reactive({
  type: 'feat',
  component: 'auth',
  title: 'Add login with passkeys',
  description: 'Passkeys replace passwords for new accounts.|Existing accounts keep working.',
  breaking: '',
  issues: '42'
});

const settings = reactive({ ...DEFAULTS, scopes: 'auth, api, ui' });

const copied = ref('');

const commitType = computed(
  () => DEFAULT_COMMIT_TYPES.find(({ name }) => name === answers.type) ?? DEFAULT_COMMIT_TYPES[0]
);

const message = computed(() =>
  formatMessage({
    data: { ...answers, emoji: commitType.value.emoji, code: commitType.value.code },
    config: settings
  })
);

const header = computed(() => message.value.split('\n')[0] ?? '');

const scopes = computed(() =>
  settings.scopes
    .split(',')
    .map((scope) => scope.trim())
    .filter(Boolean)
);

const quote = (value: string) => `'${value.replaceAll("'", "'\\''")}'`;

const command = computed(() => {
  const flags: [string, string][] = [
    ['-t', answers.type],
    ['-s', answers.component],
    ['-m', answers.title],
    ['-b', answers.description],
    ['--breaking', answers.breaking],
    ['-i', answers.issues]
  ];

  return [
    'jazzer',
    ...flags.filter(([, value]) => value.trim()).map(([flag, value]) => `${flag} ${quote(value)}`),
    '-y'
  ].join(' ');
});

const config = computed(() => {
  const changed = Object.fromEntries(
    SETTING_KEYS.filter((key) => settings[key] !== DEFAULTS[key]).map((key) => [key, settings[key]])
  );

  return JSON.stringify(
    {
      $schema: SCHEMA_URL,
      ...changed,
      ...(scopes.value.length > 0 ? { scopes: scopes.value } : {})
    },
    null,
    2
  );
});

const copy = async ({ key, text }: { key: string; text: string }) => {
  try {
    await navigator.clipboard.writeText(text);
    copied.value = key;
  } catch {
    // No clipboard access (an insecure origin, a denied permission): the text stays selectable.
    copied.value = '';
  }

  setTimeout(() => {
    copied.value = '';
  }, 1500);
};
</script>

<template>
  <div class="playground">
    <section class="panel">
      <h2>Answers</h2>

      <label>
        Type
        <select v-model="answers.type">
          <option v-for="type in DEFAULT_COMMIT_TYPES" :key="type.name" :value="type.name">
            {{ type.emoji }} {{ type.name }} — {{ type.description }}
          </option>
        </select>
      </label>

      <label>
        Scope
        <input v-model="answers.component" list="playground-scopes" placeholder="optional">
        <datalist id="playground-scopes">
          <option v-for="scope in scopes" :key="scope" :value="scope" />
        </datalist>
      </label>

      <label>
        Title
        <input v-model="answers.title">
      </label>

      <label>
        Description <small>("{{ settings.breaklineChar || 'off' }}" starts a new line)</small>
        <textarea v-model="answers.description" rows="3" />
      </label>

      <label>
        Breaking change
        <input v-model="answers.breaking" placeholder="empty: not breaking">
      </label>

      <label>
        Issues
        <input v-model="answers.issues" placeholder="12, 34">
      </label>

      <details>
        <summary>Settings</summary>

        <label>
          Language
          <select v-model="settings.language">
            <option v-for="language in LANGUAGES" :key="language" :value="language">{{ language }}</option>
          </select>
        </label>

        <label>
          Scopes <small>(comma separated)</small>
          <input v-model="settings.scopes">
        </label>

        <label>
          Template
          <textarea v-model="settings.template" rows="8" class="mono" />
        </label>

        <div class="row">
          <label>
            Issue prefix
            <input v-model="settings.issuePrefix">
          </label>
          <label>
            Header max length
            <input v-model.number="settings.headerMaxLength" type="number" min="1">
          </label>
          <label>
            Body line length
            <input v-model.number="settings.bodyLineLength" type="number" min="0">
          </label>
        </div>

        <label class="check"><input v-model="settings.lowercaseTitle" type="checkbox"> Lower-case the title</label>
        <label class="check"><input v-model="settings.showBanner" type="checkbox"> Show the banner</label>
        <label class="check"><input v-model="settings.confirmCommit" type="checkbox"> Confirm before committing</label>
      </details>
    </section>

    <section class="panel">
      <h2>
        Commit message
        <span class="counter" :class="[{ over: header.length > settings.headerMaxLength }]">
          header {{ header.length }}/{{ settings.headerMaxLength }}
        </span>
      </h2>
      <pre class="output">{{ message }}</pre>
      <button type="button" aria-live="polite" @click="copy({ key: 'message', text: message })">
        {{ copied === 'message' ? 'Copied' : 'Copy' }}
      </button>

      <h2>Same commit from the command line</h2>
      <pre class="output">{{ command }}</pre>
      <button type="button" aria-live="polite" @click="copy({ key: 'command', text: command })">
        {{ copied === 'command' ? 'Copied' : 'Copy' }}
      </button>

      <h2>jazzer.config.json</h2>
      <pre class="output">{{ config }}</pre>
      <button type="button" aria-live="polite" @click="copy({ key: 'config', text: config })">
        {{ copied === 'config' ? 'Copied' : 'Copy' }}
      </button>
    </section>
  </div>
</template>

<style scoped>
.playground {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr));
  gap: 24px;
  margin-top: 24px;
}

.panel h2 {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin: 20px 0 8px;
}

.panel h2:first-child {
  margin-top: 0;
}

label {
  display: block;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 500;
}

label small {
  color: var(--vp-c-text-2);
  font-weight: 400;
}

input:not([type='checkbox']),
select,
textarea {
  display: block;
  width: 100%;
  margin-top: 4px;
  padding: 6px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font: inherit;
  font-weight: 400;
  min-width: 0;
}

.mono,
.output {
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
}

.row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(7rem, 1fr));
  gap: 8px;
}

.check {
  display: flex;
  gap: 8px;
  align-items: center;
  font-weight: 400;
}

details summary {
  margin: 8px 0 12px;
  cursor: pointer;
  font-weight: 600;
}

.output {
  margin: 0 0 8px;
  padding: 12px 14px;
  border-radius: 8px;
  background: var(--vp-code-block-bg);
  white-space: pre-wrap;
  word-break: break-word;
}

.counter {
  color: var(--vp-c-text-2);
  font-size: 13px;
  font-weight: 400;
}

.counter.over {
  color: var(--vp-c-danger-1);
}

button {
  padding: 4px 12px;
  border: 1px solid var(--vp-c-brand-1);
  border-radius: 6px;
  color: var(--vp-c-brand-1);
  font-size: 13px;
}

button:hover {
  background: var(--vp-c-brand-soft);
}
</style>
