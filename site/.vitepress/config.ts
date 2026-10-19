import { defineConfig } from 'vitepress';
import llmstxt from 'vitepress-plugin-llms';

import { version } from '../../package.json';
import { writeSchema } from '../../scripts/generate-schema';

const REPO = 'https://github.com/Zilero232/commit-jazzer';
const SITE = 'https://zilero232.github.io/commit-jazzer/';
const DESCRIPTION = 'Interactive Conventional Commits with emoji: a CLI, a git hook and a Commitizen adapter.';

// Lets search engines and AI assistants read the package as software, not as a random page.
const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'commit-jazzer',
  description: DESCRIPTION,
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Linux, macOS, Windows',
  softwareVersion: version,
  license: 'https://opensource.org/licenses/MIT',
  url: SITE,
  codeRepository: REPO,
  downloadUrl: 'https://www.npmjs.com/package/commit-jazzer',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
};

export default defineConfig({
  title: 'commit-jazzer',
  description: DESCRIPTION,
  base: '/commit-jazzer/',
  // The pages are plain Markdown in docs/; this folder holds only the site around them.
  srcDir: '../docs',
  lang: 'en-US',
  cleanUrls: true,
  vite: {
    // public/ sits next to the site code, not among the pages.
    publicDir: '../site/public',
    // The config reference page renders the schema, and the site serves it at the `$schema` URL.
    plugins: [
      { name: 'commit-jazzer-schema', buildStart: () => writeSchema('site') },
      // llms.txt and llms-full.txt: the docs as plain Markdown for AI assistants (https://llmstxt.org).
      llmstxt({ ignoreFiles: ['playground.md'] })
    ]
  },
  lastUpdated: true,
  sitemap: { hostname: SITE },
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/commit-jazzer/logo.svg' }],
    ['meta', { name: 'theme-color', content: '#7c3aed' }],
    ['meta', { name: 'keywords', content: 'conventional commits, commitizen, git hook, commit message, gitmoji, cli' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: 'commit-jazzer' }],
    ['meta', { property: 'og:title', content: 'commit-jazzer' }],
    ['meta', { property: 'og:description', content: DESCRIPTION }],
    ['meta', { property: 'og:url', content: SITE }],
    ['meta', { name: 'twitter:card', content: 'summary' }],
    ['script', { type: 'application/ld+json' }, JSON.stringify(STRUCTURED_DATA)]
  ],
  // A canonical URL per page, so copies and the trailing-slash variant do not compete with it.
  transformPageData: (pageData) => {
    const path = pageData.relativePath.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '');

    pageData.frontmatter.head ??= [];
    pageData.frontmatter.head.push(['link', { rel: 'canonical', href: `${SITE}${path}` }]);
  },
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
