import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { SELECTION_CHANGE_COMMAND, COMMAND_PRIORITY_LOW } from 'lexical';
import { mergeRegister } from '@lexical/utils';

// Runs `handler` inside `editor.read()` once on mount, then on every
// SELECTION_CHANGE_COMMAND and every update listener tick. Centralises the
// "observe selection state" pattern used by useActiveFormat, TableActionsPlugin
// and ImagePlugin so each consumer gets a single subscription per editor.
export function useSelectionSubscription(handler, deps = []) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    const run = () => editor.read(() => handler(editor));
    run();
    return mergeRegister(
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => { run(); return false; },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerUpdateListener(() => run()),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, ...deps]);
}

export default useSelectionSubscription;
