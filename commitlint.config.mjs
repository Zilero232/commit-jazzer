// The repo's own commits are made with commit-jazzer, so the emoji sits right after the colon
// and the subject starts with it: subject-case cannot judge that, the tool lower-cases titles itself.
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'subject-case': [0],
    'type-enum': [0]
  }
};
