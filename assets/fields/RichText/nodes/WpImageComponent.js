import { useCallback, useEffect, useRef } from 'react';
import clsx from 'clsx';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import {
  $getNodeByKey,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
} from 'lexical';
import { mergeRegister } from '@lexical/utils';
import { $isWpImageNode } from './WpImageNode';

export function WpImageComponent({ nodeKey, src, alt, width, height }) {
  const [editor] = useLexicalComposerContext();
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);
  const imgRef = useRef(null);

  const handleClick = useCallback(
    (event) => {
      if (event.target === imgRef.current) {
        event.preventDefault();
        // Batch the selection transition inside an editor.update so Lexical
        // coalesces both state changes into a single reconciliation pass.
        // This both avoids the React 18 flushSync-in-lifecycle warning and
        // keeps the state transition synchronous, so a subsequent Delete/
        // Backspace sees `isSelected === true` on the same tick.
        editor.update(() => {
          clearSelection();
          setSelected(true);
        });
        return true;
      }
      return false;
    },
    [editor, clearSelection, setSelected],
  );

  const handleDelete = useCallback(
    (event) => {
      if (!isSelected) return false;
      event?.preventDefault?.();
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isWpImageNode(node)) node.remove();
      });
      return true;
    },
    [editor, isSelected, nodeKey],
  );

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(CLICK_COMMAND, handleClick, COMMAND_PRIORITY_LOW),
      editor.registerCommand(KEY_BACKSPACE_COMMAND, handleDelete, COMMAND_PRIORITY_LOW),
      editor.registerCommand(KEY_DELETE_COMMAND, handleDelete, COMMAND_PRIORITY_LOW),
    );
  }, [editor, handleClick, handleDelete]);

  return (
    <img
      ref={imgRef}
      src={src}
      alt={alt || ''}
      width={width || undefined}
      height={height || undefined}
      draggable={false}
      className={clsx('wpifycf-richtext-image', isSelected && 'wpifycf-richtext-image--selected')}
    />
  );
}
