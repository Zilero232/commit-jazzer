export const PACKAGE_NAME = 'commit-jazzer';

export const SCHEMA_URL = 'https://zilero232.github.io/commit-jazzer/commit-jazzer-schema.json';

// Fields a commit message is built from, in the order the questions are asked.
export const COMMIT_FIELDS = ['type', 'component', 'title', 'description', 'breaking', 'issues', 'comment'] as const;

export type CommitField = (typeof COMMIT_FIELDS)[number];

export const LANGUAGES = ['en', 'ru', 'es', 'de', 'fr', 'it', 'pt', 'pl', 'tr', 'uk', 'zh', 'ja', 'ko'] as const;

export type Language = (typeof LANGUAGES)[number];
