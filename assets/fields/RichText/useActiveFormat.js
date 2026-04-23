import { useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  CAN_UNDO_COMMAND,
  CAN_REDO_COMMAND,
} from 'lexical';
import { $isHeadingNode, $isQuoteNode } from '@lexical/rich-text';
import { $isListNode } from '@lexical/list';
import { LinkNode } from '@lexical/link';
import { $getNearestNodeOfType, mergeRegister } from '@lexical/utils';
import { $isCodeNode } from '@lexical/code';
import { useSelectionSubscription } from './useSelectionSubscription';

export function useActiveFormat() {
  const [editor] = useLexicalComposerContext();
  const [state, setState] = useState({
    bold: false, italic: false, strikethrough: false,
    blockType: 'paragraph',
    listType: null,            // 'ul' | 'ol' | null
    alignment: 'left',
    isLink: false,
    canUndo: false,
    canRedo: false,
  });

  useSelectionSubscription(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return;
    const anchorNode = selection.anchor.getNode();
    // anchorNode is the root when the editor is empty; there's no top-level
    // element yet. Use the no-throw variant and bail to defaults in that case.
    const element = anchorNode.getTopLevelElement?.();
    let blockType = 'paragraph';
    let listType = null;
    let format = 'left';
    if (element) {
      if ($isHeadingNode(element)) blockType = element.getTag();
      else if ($isQuoteNode(element)) blockType = 'blockquote';
      else if ($isCodeNode(element)) blockType = 'code-block';
      if ($isListNode(element)) {
        listType = element.getListType() === 'number' ? 'ol' : 'ul';
      } else {
        // Walk up ancestors to find a containing ListNode (when anchor is inside a list item).
        let cursor = anchorNode;
        while (cursor && !cursor.isRoot?.()) {
          if ($isListNode(cursor)) {
            listType = cursor.getListType() === 'number' ? 'ol' : 'ul';
            break;
          }
          cursor = cursor.getParent?.();
        }
      }
      format = element.getFormatType?.() || 'left';
    }
    const linkNode = $getNearestNodeOfType(anchorNode, LinkNode);
    setState((prev) => ({
      ...prev,
      bold: selection.hasFormat('bold'),
      italic: selection.hasFormat('italic'),
      strikethrough: selection.hasFormat('strikethrough'),
      blockType,
      listType,
      alignment: format || 'left',
      isLink: !!linkNode,
    }));
  });

  // Undo/redo availability lives on a separate command channel from selection
  // changes, so it keeps its own registration.
  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => { setState((p) => ({ ...p, canUndo: payload })); return false; },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => { setState((p) => ({ ...p, canRedo: payload })); return false; },
        COMMAND_PRIORITY_LOW,
      ),
    );
  }, [editor]);

  return state;
}

export default useActiveFormat;
