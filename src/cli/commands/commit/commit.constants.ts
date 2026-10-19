// With one of these git commits something even when nothing is staged.
export const COMMITS_WITHOUT_STAGE = new Set([
  '-a',
  '--all',
  '--amend',
  '--allow-empty',
  '-p',
  '--patch',
  '--interactive',
  '-o',
  '--only',
  '-i',
  '--include'
]);

// The short ones above (`-a`, `-p`, …) combined with others, as in `git commit -av`.
const SHORT_LETTERS = [...COMMITS_WITHOUT_STAGE].filter((flag) => /^-\w$/.test(flag)).map((flag) => flag.slice(1));

export const SHORT_FLAGS_WITHOUT_STAGE = new RegExp(`^-[a-zA-Z]*[${SHORT_LETTERS.join('')}][a-zA-Z]*$`);
