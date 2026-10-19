export {
  getCommentChar,
  getCurrentBranch,
  getGitDir,
  getHooksDir,
  getTopLevel,
  gitCommit,
  hasStagedChanges,
  isInsideWorkTree,
  isTracked
} from './git';
export type * from './git.types';
export { clearLastMessage, readLastMessage, saveLastMessage } from './last-message';
