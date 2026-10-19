// `type(scope)!: subject`, as the Conventional Commits parsers read it: the type is `\w+`.
export const HEADER = /^(?<type>\w+)(?:\((?<scope>[^()\r\n]*)\))?(?<bang>!)?:(?: (?<subject>.*)|$)/u;

// Messages git and other tools write themselves; they are not linted.
export const SKIPPED = /^(?:Merge |Revert "|Reapply "|fixup! |squash! |amend! |Initial commit$)/;
