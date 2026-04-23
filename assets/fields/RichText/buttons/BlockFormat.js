import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection, $isRangeSelection, $createParagraphNode } from 'lexical';
import { $setBlocksType } from '@lexical/selection';
import { $createHeadingNode, $createQuoteNode } from '@lexical/rich-text';
import { $createCodeNode } from '@lexical/code';
import { HEADING_LABELS } from '../config';
import useFloatingAnchor from '../useFloatingAnchor';

function makeNode(kind) {
  switch (kind) {
    case 'paragraph': return $createParagraphNode();
    case 'h1': case 'h2': case 'h3': case 'h4': case 'h5': case 'h6':
      return $createHeadingNode(kind);
    case 'pre':
      // Lexical's default paragraph has no tag for <pre>; use CodeNode as the closest fallback.
      return $createCodeNode();
    case 'code-block': return $createCodeNode();
    case 'blockquote': return $createQuoteNode();
    default: return $createParagraphNode();
  }
}

export function BlockFormatDropdown({ enabledIds, blockType, disabled }) {
  const [editor] = useLexicalComposerContext();
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);

  const pos = useFloatingAnchor(
    () => anchorRef.current?.getBoundingClientRect() ?? null,
    { open, anchorKey: open ? 1 : 0 },
  );

  const items = enabledIds
    .map((id) => id.replace(/^block:/, ''))
    .filter((k) => HEADING_LABELS[k]);

  if (!items.length) return null;

  const currentLabel = HEADING_LABELS[blockType] || HEADING_LABELS.paragraph;

  const apply = (kind) => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;
      $setBlocksType(selection, () => makeNode(kind));
    });
    setOpen(false);
  };

  return (
    <>
      <Button
        ref={anchorRef}
        className="wpifycf-field-richtext__dropdown-trigger"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{currentLabel}</span>
        <span aria-hidden="true">▾</span>
      </Button>
      {open && pos && createPortal(
        <ul
          className="wpifycf-field-richtext__dropdown-menu"
          style={{ position: 'absolute', top: pos.top, left: pos.left }}
          onMouseLeave={() => setOpen(false)}
        >
          {items.map((k) => (
            <li key={k}>
              <button
                type="button"
                className="wpifycf-field-richtext__dropdown-item"
                onClick={() => apply(k)}
              >
                {HEADING_LABELS[k]}
              </button>
            </li>
          ))}
        </ul>,
        document.body,
      )}
    </>
  );
}
