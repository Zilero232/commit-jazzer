import { defineConfig } from 'vitepress';

import { version } from '../../package.json';

const REPO = 'https://github.com/Zilero232/commit-jazzer';

export default defineConfig({
  title: 'commit-jazzer',
  description: 'Interactive Conventional Commits with emoji: a CLI, a git hook and a Commitizen adapter.',
  base: '/commit-jazzer/',
  lang: 'en-US',
  cleanUrls: true,
  lastUpdated: true,
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/commit-jazzer/logo.svg' }],
    ['meta', { name: 'theme-color', content: '#7c3aed' }]
  ],
  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: 'Guide', link: '/guide/getting-started', activeMatch: '/guide/' },
      { text: 'Reference', link: '/reference/config', activeMatch: '/reference/' },
      { text: 'Playground', link: '/playground' },
      {
        text: `v${version}`,
        items: [
          { text: 'Changelog', link: `${REPO}/blob/main/CHANGELOG.md` },
          { text: 'npm', link: 'https://www.npmjs.com/package/commit-jazzer' }
        ]
      }
    ],
    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Getting started', link: '/guide/getting-started' },
          { text: 'Message format', link: '/guide/message-format' },
          { text: 'Configuration', link: '/guide/configuration' },
          { text: 'Recipes', link: '/guide/recipes' },
          { text: 'Migrating from 1.x', link: '/guide/migration' },
          { text: 'FAQ', link: '/guide/faq' }
        ]
      },
      {
        text: 'Reference',
        items: [
          { text: 'Config options', link: '/reference/config' },
          { text: 'CLI', link: '/reference/cli' },
          { text: 'Commit types', link: '/reference/commit-types' },
          { text: 'JavaScript API', link: '/reference/api' }
        ]
      },
      { text: 'Playground', link: '/playground' }
    ],
    socialLinks: [
      { icon: 'github', link: REPO },
      { icon: 'npm', link: 'https://www.npmjs.com/package/commit-jazzer' }
    ],
    editLink: { pattern: `${REPO}/edit/main/docs/:path`, text: 'Edit this page on GitHub' },
    search: { provider: 'local' },
    outline: [2, 3],
    footer: { message: 'Released under the MIT License.', copyright: 'Copyright © 2024-present Artemev Alexandr' }
  }
});
