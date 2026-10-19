// v9 (the version semantic-release's notes generator works with) ships no types; the tests only need this.
declare module 'conventional-changelog-conventionalcommits' {
  import type { ParserOptions } from 'conventional-commits-parser';

  const createPreset: (config?: object) => Promise<{ parser?: ParserOptions }>;
  export default createPreset;
}
