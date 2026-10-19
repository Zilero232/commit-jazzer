// semantic-release: the version comes from the commit messages since the last tag.
// The repo's commits are written with commit-jazzer, so its own types (upgrade, remove, …) count too.

// Sections of the release notes; the preset alone would hide every type but feat, fix, perf and revert.
const types = [
  { type: 'feat', section: 'Features' },
  { type: 'fix', section: 'Bug Fixes' },
  { type: 'perf', section: 'Performance' },
  { type: 'security', section: 'Security' },
  { type: 'revert', section: 'Reverts' },
  { type: 'refactor', section: 'Refactoring' },
  { type: 'remove', section: 'Removals' },
  { type: 'upgrade', section: 'Dependencies' },
  { type: 'downgrade', section: 'Dependencies' },
  { type: 'build', section: 'Build' },
  { type: 'docs', section: 'Documentation' }
];

/** @type {import('semantic-release').GlobalConfig} */
export default {
  branches: ['main'],
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        preset: 'conventionalcommits',
        presetConfig: { types },
        // The defaults apply only when no rule matches, so breaking changes come first: `refactor!:` is a major.
        releaseRules: [
          { breaking: true, release: 'major' },
          { type: 'breaking', release: 'major' },
          { type: 'refactor', release: 'patch' },
          { type: 'security', release: 'patch' },
          { type: 'upgrade', release: 'patch' },
          { type: 'downgrade', release: 'patch' },
          { type: 'remove', release: 'patch' },
          { type: 'build', release: 'patch' },
          { type: 'docs', scope: 'readme', release: 'patch' }
        ]
      }
    ],
    ['@semantic-release/release-notes-generator', { preset: 'conventionalcommits', presetConfig: { types } }],
    '@semantic-release/changelog',
    '@semantic-release/npm',
    [
      '@semantic-release/git',
      {
        assets: ['CHANGELOG.md', 'package.json'],
        // semantic-release fills this lodash template itself.
        // eslint-disable-next-line no-template-curly-in-string
        message: 'chore(release): 🔖 ${nextRelease.version} [skip ci]'
      }
    ],
    '@semantic-release/github'
  ]
};
