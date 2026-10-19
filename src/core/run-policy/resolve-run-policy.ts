import type { ResolveRunPolicyInput, RunPolicy } from './run-policy.types';

/**
 * Decides what a run does: which questions it asks, whether it confirms and shows the banner, whether it
 * reads the branch. Without a terminal nothing is asked or shown, and nothing is guessed from the branch:
 * scripts and agents get exactly what their flags say.
 */
export const resolveRunPolicy = ({
  config,
  interactive,
  yes = false,
  alias = false,
  confirm,
  showBanner
}: ResolveRunPolicyInput): RunPolicy => {
  if (!interactive) {
    return { ask: 'none', confirm: false, banner: false, useBranch: false };
  }

  const quick = yes || alias;

  return {
    ask: quick ? 'required' : 'all',
    confirm: confirm ?? (quick ? false : config.confirmCommit),
    banner: showBanner ?? (quick ? false : config.showBanner),
    useBranch: config.inferFromBranch
  };
};
