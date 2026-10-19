'use strict';

// Commitizen loads adapters with require(). The package is ESM, so this shim imports it lazily:
// requiring the adapter stays cheap and the ESM graph loads only when `git cz` actually prompts.

/** @type {typeof import('./dist/index.mjs').prompter} */
exports.prompter = async (...args) => {
  const { prompter } = await import('./dist/index.mjs');

  return prompter(...args);
};
