// How a push to main becomes a release: semantic-release reads the commits since the last tag,
// picks the next version from their types, publishes to npm and writes the changelog.

/**
 * Every commit type that matters for a release, in the order of the release notes.
 *
 * `section` is its heading in the release notes; `release` is the version bump it causes on its own (`null`: none).
 * A breaking change (`feat!:`, `BREAKING CHANGE:`) is a major whatever its type.
 * Types not listed here (chore, ci, test, style, …) neither release nor show up in the notes.
 */
const COMMIT_TYPES = [
  { type: 'breaking', section: 'Breaking Changes', release: 'major' },
  { type: 'feat', section: 'Features', release: 'minor' },
  { type: 'fix', section: 'Bug Fixes', release: 'patch' },
  { type: 'perf', section: 'Performance', release: 'patch' },
  { type: 'security', section: 'Security', release: 'patch' },
  { type: 'revert', section: 'Reverts', release: 'patch' },
  { type: 'refactor', section: 'Refactoring', release: 'patch' },
  { type: 'remove', section: 'Removals', release: 'patch' },
  { type: 'upgrade', section: 'Dependencies', release: 'patch' },
  { type: 'downgrade', section: 'Dependencies', release: 'patch' },
  { type: 'build', section: 'Build', release: 'patch' },
  // Documentation is listed in the notes but releases nothing, except README changes: npm shows the
  // README of the latest version, so `docs(readme):` publishes a patch to update it.
  { type: 'docs', section: 'Documentation', release: null }
];

const RELEASE_RULES = [
  // Rules are checked in order and the first match wins, so breaking changes go first.
  { breaking: true, release: 'major' },
  { type: 'docs', scope: 'readme', release: 'patch' },
  ...COMMIT_TYPES.filter(({ release }) => release).map(({ type, release }) => ({ type, release }))
];

// The "conventionalcommits" preset with our sections; on its own it would hide every type but feat, fix, perf and revert.
const PRESET = {
  preset: 'conventionalcommits',
  presetConfig: { types: COMMIT_TYPES.map(({ type, section }) => ({ type, section })) }
};

/** @type {import('semantic-release').GlobalConfig} */
export default {
  branches: ['main'],
  plugins: [
    // 1. Pick the version from the commits.
    ['@semantic-release/commit-analyzer', { ...PRESET, releaseRules: RELEASE_RULES }],
    // 2. Write the release notes.
    ['@semantic-release/release-notes-generator', PRESET],
    // 3. Prepend them to CHANGELOG.md.
    '@semantic-release/changelog',
    // 4. Set the version in package.json and publish to npm.
    '@semantic-release/npm',
    // 5. Commit CHANGELOG.md and package.json back to main and tag the release.
    [
      '@semantic-release/git',
      {
        assets: ['CHANGELOG.md', 'package.json'],
        // semantic-release fills in the version; [skip ci] keeps this commit from starting another release.
        // eslint-disable-next-line no-template-curly-in-string
        message: 'chore(release): 🔖 ${nextRelease.version} [skip ci]'
      }
    ],
    // 6. Create the GitHub release and comment on the issues and pull requests it closes.
    //    A failed release is a red CI run already, so it opens no issue.
    ['@semantic-release/github', { failTitle: false, failComment: false }]
  ]
};
