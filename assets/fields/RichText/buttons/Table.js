import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { blockTable as tableIcon } from '@wordpress/icons';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { INSERT_TABLE_COMMAND } from '@lexical/table';
import useFloatingAnchor from '../useFloatingAnchor';

const MAX_ROWS = 8;
const MAX_COLS = 10;

export function TableButton({ disabled }) {
  const [editor] = useLexicalComposerContext();
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState({ rows: 0, cols: 0 });
  const anchorRef = useRef(null);

  const pos = useFloatingAnchor(
    () => anchorRef.current?.getBoundingClientRect() ?? null,
    { open, anchorKey: open ? 1 : 0 },
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    const onClickOutside = (e) => {
      if (!e.target.closest('.wpifycf-field-richtext__popover--table')
          && !e.target.closest('.wpifycf-field-richtext__table-trigger')) {
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

  const insert = (rows, cols) => {
    if (!rows || !cols) return;
    editor.dispatchCommand(INSERT_TABLE_COMMAND, {
      rows: String(rows),
      columns: String(cols),
      includeHeaders: { rows: true, columns: false },
    });
    setOpen(false);
    setHover({ rows: 0, cols: 0 });
  };

  const label = hover.rows && hover.cols
    ? `${hover.rows} × ${hover.cols}`
    : __('Pick table size', 'wpify-custom-fields');

  return (
    <>
      <Button
        ref={anchorRef}
        className="wpifycf-field-richtext__button wpifycf-field-richtext__table-trigger"
        icon={tableIcon}
        label={__('Insert table', 'wpify-custom-fields')}
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
      />
      {open && pos && createPortal(
        <div
          className="wpifycf-field-richtext__popover wpifycf-field-richtext__popover--table"
          style={{ position: 'absolute', top: pos.top, left: pos.left }}
          onMouseDown={(e) => e.preventDefault()}
        >
          <div className="wpifycf-field-richtext__table-label">{label}</div>
          <div
            className="wpifycf-field-richtext__table-grid"
            onMouseLeave={() => setHover({ rows: 0, cols: 0 })}
          >
            {Array.from({ length: MAX_ROWS }).flatMap((_, rIdx) =>
              Array.from({ length: MAX_COLS }).map((__unused, cIdx) => {
                const r = rIdx + 1;
                const c = cIdx + 1;
                const active = r <= hover.rows && c <= hover.cols;
                return (
                  <button
                    key={`${r}-${c}`}
                    type="button"
                    className={`wpifycf-field-richtext__table-cell${active ? ' wpifycf-field-richtext__table-cell--active' : ''}`}
                    onMouseEnter={() => setHover({ rows: r, cols: c })}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => insert(r, c)}
                    aria-label={`${r} × ${c}`}
                  />
                );
              })
            )}
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
