import type { Theme } from 'vitepress';

import DefaultTheme from 'vitepress/theme';

import CommitTypesTable from './components/commit-types-table.vue';
import ConfigReference from './components/config-reference.vue';
import JazzerPlayground from './components/jazzer-playground.vue';

import './style.css';

export default {
  extends: DefaultTheme,
  enhanceApp: ({ app }) => {
    app.component('CommitTypesTable', CommitTypesTable);
    app.component('ConfigReference', ConfigReference);
    app.component('JazzerPlayground', JazzerPlayground);
  }
} satisfies Theme;
