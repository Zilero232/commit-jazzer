// Vitest setup: tests that run git must not see the environment of a git hook (`bun run test` runs in
// pre-commit, where GIT_INDEX_FILE points at the real index and `git -c` adds GIT_CONFIG_PARAMETERS) or
// the developer's own git and commit-jazzer config.
for (const variable of Object.keys(process.env).filter((name) => name.startsWith('GIT_'))) {
  delete process.env[variable];
}

process.env.GIT_CONFIG_GLOBAL = '/dev/null';
process.env.GIT_CONFIG_NOSYSTEM = '1';
process.env.GIT_EDITOR = 'true';
process.env.XDG_CONFIG_HOME = '/nonexistent';
process.env.HOME = '/nonexistent';
delete process.env.JAZZER_CONFIG;
