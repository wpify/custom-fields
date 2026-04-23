import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { PASTE_COMMAND, COMMAND_PRIORITY_HIGH, $getSelection, $isRangeSelection } from 'lexical';

export function PasteAsTextPlugin({ armedRef, onFired }) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    return editor.registerCommand(
      PASTE_COMMAND,
      (event) => {
        if (!armedRef.current) return false;
        const text = event.clipboardData?.getData('text/plain') ?? '';
        event.preventDefault();
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            selection.insertText(text);
          }
        });
        armedRef.current = false;
        onFired?.();
        return true;
      },
      COMMAND_PRIORITY_HIGH,
    );
  }, [editor, armedRef, onFired]);
  return null;
}

export default PasteAsTextPlugin;
