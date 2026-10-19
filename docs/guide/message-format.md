# Message format

## The default

```text
<type>(<scope>)!: <emoji> <title>

<description>

<comment>

BREAKING CHANGE: <breaking>
Closes <issue>
Closes <issue>
```

Empty parts disappear, together with the blank lines around them. With only a type and a title the message is a single line:

```text
fix: 🐛 handle an empty config file
```

| Part               | Question    | Notes                                                                                                                                                                                    |
| ------------------ | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `type`             | type        | Chosen from the list; brings its emoji.                                                                                                                                                  |
| `(scope)`          | component   | Wrapped in parentheses only when given.                                                                                                                                                  |
| `!`                | breaking    | Added when the breaking change answer is not empty.                                                                                                                                      |
| `title`            | title       | First letter lower-cased (unless it is an acronym such as `API`), trailing period removed. Turn off with `lowercaseTitle: false`.                                                        |
| `description`      | description | The body. `\|` starts a new line (`breaklineChar`); one space around it is dropped, more is kept as indentation. Wrapped at 100 columns (`bodyLineLength`).                              |
| `comment`          | comment     | Another body paragraph. Not asked by default.                                                                                                                                            |
| `BREAKING CHANGE:` | breaking    | The footer semantic-release looks for.                                                                                                                                                   |
| `Closes #12`       | issues      | One line per issue, so GitHub closes each of them. `12 13` becomes `#12` and `#13`; keys like `JIRA-7` stay; a typed `closes` or `fixes:` is dropped. The word comes from `issuePrefix`. |

## Why the emoji goes after the colon

Tools parse the header with a pattern like `type(scope)!: subject`. With the emoji after the colon it becomes part of the subject, so:

- commitlint with `@commitlint/config-conventional` accepts the message;
- semantic-release and conventional-changelog read the type, the scope and the breaking change correctly.

An emoji in front of the type (`✨ feat: …`) breaks both. The test suite lints and parses generated messages for every combination of fields to keep this true.

commitlint's `subject-case` rule cannot judge a subject that starts with an emoji. commit-jazzer lower-cases the title itself instead.

## Header length

commitlint rejects headers over 100 characters by default. While you type the title, the counter shows how much of `headerMaxLength` is left after the type, scope and emoji. When the breaking change question is still ahead, one character is kept for the `!`.

The answers have limits of their own: the title 70 characters, the scope 30, the issues 100. Change them with `baseQuestionsOptions[].options.validations.length`. The scope, the title and the breaking change must fit on one line, and the scope cannot contain parentheses.

## Changing the template

`template` is a [Handlebars](https://handlebarsjs.com/guide/) template. Values are inserted as typed: `&`, `<` and quotes are not escaped.

| Variable                                                                     | Value                                                                |
| ---------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `type`, `component`, `title`, `description`, `comment`, `breaking`, `issues` | The answers.                                                         |
| `emoji`, `code`                                                              | The emoji of the type and its shortcode, e.g. `✨` and `:sparkles:`. |
| `scope`                                                                      | `(component)`, or empty.                                             |
| `bang`                                                                       | `!` for a breaking change, or empty.                                 |
| `issuePrefix`                                                                | The `issuePrefix` option.                                            |
| `issueFooter`                                                                | One `<issuePrefix> <issue>` line per issue.                          |

Shortcodes instead of unicode emoji: the default template with `{{code}}` in place of `{{emoji}}`.

```json
{
  "template": "{{type}}{{scope}}{{bang}}: {{code}} {{title}}\n\n{{description}}\n\n{{comment}}\n\n{{#if breaking}}BREAKING CHANGE: {{breaking}}{{/if}}\n{{issueFooter}}"
}
```

Questions whose answer the template never writes are not asked: with the 1.x format below only the type and the title are. The 1.x format:

```json
{
  "template": "{{type}}: {{emoji}} - {{title}}"
}
```

The only rule for valid Conventional Commits: keep `{{type}}{{scope}}{{bang}}: ` at the start of the first line.

Body lines are wrapped at `bodyLineLength`; footer lines (`BREAKING CHANGE: …`, `Closes #12`, `Co-authored-by: …`) are never wrapped, and a wrapped line never starts with `#`. In hook mode git removes lines that start with `#` after you close the editor, so don't start a body line with an issue number.
