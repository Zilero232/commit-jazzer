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
