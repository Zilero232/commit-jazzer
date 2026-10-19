// A git trailer (`Closes #12`, `Co-authored-by: …`) or a breaking change footer: never wrapped, not held to the body width.
export const FOOTER_LINE = /^(?:BREAKING[ -]CHANGE: |[\w-]+(?:: | #))/;
