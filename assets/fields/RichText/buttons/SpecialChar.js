import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { symbol as symbolIcon } from '@wordpress/icons';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection, $isRangeSelection } from 'lexical';
import { getSpecialChars } from '../config';
import useFloatingAnchor from '../useFloatingAnchor';

export function SpecialCharButton({ disabled }) {
  const [editor] = useLexicalComposerContext();
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);
  const chars = getSpecialChars();

  const pos = useFloatingAnchor(
    () => anchorRef.current?.getBoundingClientRect() ?? null,
    { open, anchorKey: open ? 1 : 0 },
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    const onClickOutside = (e) => {
      if (!e.target.closest('.wpifycf-field-richtext__popover--special-chars')
          && !e.target.closest('.wpifycf-field-richtext__special-chars-trigger')) {
        setOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClickOutside);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClickOutside);
    };
  }, [open]);

  const insert = (c) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) selection.insertText(c);
    });
    setOpen(false);
  };

  return (
    <>
      <Button
        ref={anchorRef}
        className="wpifycf-field-richtext__button wpifycf-field-richtext__special-chars-trigger"
        icon={symbolIcon}
        label={__('Insert special character', 'wpify-custom-fields')}
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
      />
      {open && pos && createPortal(
        <div
          className="wpifycf-field-richtext__popover wpifycf-field-richtext__popover--special-chars"
          style={{ position: 'absolute', top: pos.top, left: pos.left }}
        >
          <div className="wpifycf-field-richtext__special-chars-grid">
            {chars.map(({ char, label }) => (
              <button
                key={char}
                type="button"
                className="wpifycf-field-richtext__special-chars-item"
                title={label}
                onClick={() => insert(char)}
              >
                {char}
              </button>
            ))}
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
