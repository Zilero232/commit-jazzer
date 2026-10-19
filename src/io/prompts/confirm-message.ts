import { styleText } from 'node:util';

import type { ConfirmMessageInput } from './prompts.types';

/** Shows the message and lets the user commit it, edit it in $EDITOR first, or cancel. Resolves with `null` on cancel. */
export const confirmMessage = async ({
  message,
  translations,
  context
}: ConfirmMessageInput): Promise<string | null> => {
  const { messages } = translations;
  const output = context?.output ?? process.stdout;
  const { default: select } = await import('@inquirer/select');

  output.write(`\n${styleText('dim', messages.preview)}\n\n${message}\n\n`);

  const action = await select(
    {
      message: messages.confirm,
      choices: [
        { name: messages.commit, value: 'commit' },
        { name: messages.edit, value: 'edit' },
        { name: messages.cancel, value: 'cancel' }
      ]
    },
    context
  );

  if (action === 'commit') {
    return message;
  }

  if (action === 'cancel') {
    return null;
  }

  const { default: editor } = await import('@inquirer/editor');
  const edited = await editor(
    { message: messages.edit, default: message, postfix: '.gitcommit', waitForUserInput: false },
    context
  );

  return edited.trim() || null;
};
