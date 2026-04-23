import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { reset as resetIcon } from '@wordpress/icons';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection, $isRangeSelection, $createParagraphNode } from 'lexical';
import { $setBlocksType } from '@lexical/selection';
import { $isLinkNode } from '@lexical/link';
import { $isHeadingNode, $isQuoteNode } from '@lexical/rich-text';
import { $isListNode } from '@lexical/list';
import { $isCodeNode } from '@lexical/code';

export function ClearFormattingButton({ disabled }) {
  const [editor] = useLexicalComposerContext();
  const onClick = () => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;
      // Strip text formats
      const nodes = selection.getNodes();
      nodes.forEach((node) => {
        if (node.getType() === 'text') {
          node.setFormat(0);
        }
      });
      // Unwrap links in selection
      nodes.forEach((node) => {
        let cursor = node;
        while (cursor) {
          if ($isLinkNode(cursor)) {
            const children = cursor.getChildren();
            children.forEach((c) => cursor.insertBefore(c));
            cursor.remove();
            break;
          }
          cursor = cursor.getParent();
        }
      });
      // Reset alignment / indent on each block
      const selectionAfter = $getSelection();
      if ($isRangeSelection(selectionAfter)) {
        const anchorNode = selectionAfter.anchor.getNode();
        const block = anchorNode.getKey() === 'root' ? null : anchorNode.getTopLevelElementOrThrow();
        if (block && block.setFormat) block.setFormat('');
        if (block && block.setIndent) block.setIndent(0);
        // Convert non-paragraph blocks to paragraph
        if (block && ($isHeadingNode(block) || $isQuoteNode(block) || $isListNode(block) || $isCodeNode(block))) {
          $setBlocksType(selectionAfter, () => $createParagraphNode());
        }
      }
    });
  };
  return (
    <Button
      className="wpifycf-field-richtext__button"
      icon={resetIcon}
      label={__('Clear formatting', 'wpify-custom-fields')}
      disabled={disabled}
      onClick={onClick}
    />
  );
}
