import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import {
  tableRowBefore,
  tableRowAfter,
  tableRowDelete,
  tableColumnBefore,
  tableColumnAfter,
  tableColumnDelete,
  trash as trashIcon,
} from '@wordpress/icons';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
} from 'lexical';
import { useSelectionSubscription } from '../useSelectionSubscription';
import {
  $computeTableMapSkipCellCheck,
  $getTableCellNodeFromLexicalNode,
  $getTableNodeFromLexicalNodeOrThrow,
  $insertTableRow__EXPERIMENTAL,
  $insertTableColumn__EXPERIMENTAL,
  $deleteTableRow__EXPERIMENTAL,
  $deleteTableColumn__EXPERIMENTAL,
  $isTableCellNode,
  $isTableSelection,
  $unmergeCell,
  TableCellHeaderStates,
} from '@lexical/table';

// 24x24 table-cell pictograms. Style matches @wordpress/icons table-row/-column
// glyphs: solid fill=currentColor, a single outer rounded rect clipping the
// inner grid so WP admin's global `svg { fill: currentColor }` renders them
// consistently with the other toolbar icons.

// Merge: 2x2 table where the TOP row is one merged cell (wide), below it two
// separated cells — the canonical "cells merged" illustration.
const MergeIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M4 4h16a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zm1 2v5h14V6H5zm0 7v5h6v-5H5zm8 0v5h6v-5h-6z"
      clipRule="evenodd"
    />
  </svg>
);

// Unmerge (split): 2x2 table where the TOP row is two separated cells, and
// the BOTTOM row is one merged cell — the canonical "split back into cells"
// illustration (inverse of Merge).
const UnmergeIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M4 4h16a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zm1 2v5h6V6H5zm8 0v5h6V6h-6zM5 13v5h14v-5H5z"
      clipRule="evenodd"
    />
  </svg>
);

function getCellFromAnchor(anchorNode) {
  let cursor = anchorNode;
  while (cursor) {
    if ($isTableCellNode(cursor)) return cursor;
    cursor = cursor.getParent?.();
  }
  return null;
}

export function TableActionsPlugin() {
  const [editor] = useLexicalComposerContext();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(null);
  const [canMerge, setCanMerge] = useState(false);
  const [canUnmerge, setCanUnmerge] = useState(false);
  const cellKeyRef = useRef(null);

  const updatePosition = useCallback(() => {
    const key = cellKeyRef.current;
    if (!key) { setPos(null); return; }
    const el = editor.getElementByKey(key);
    if (!el) { setPos(null); return; }
    const tableEl = el.closest('table');
    const rect = (tableEl || el).getBoundingClientRect();
    setPos({
      top: rect.top + window.scrollY - 38,
      left: rect.left + window.scrollX,
    });
  }, [editor]);

  useSelectionSubscription(() => {
    const selection = $getSelection();
    if ($isTableSelection(selection)) {
      // Multi-cell range selection inside a table — take the anchor cell for positioning.
      const cells = selection.getNodes().filter($isTableCellNode);
      if (cells.length === 0) {
        cellKeyRef.current = null;
        setOpen(false);
        return;
      }
      cellKeyRef.current = cells[0].getKey();
      setCanMerge(cells.length > 1);
      setCanUnmerge(false);
      setOpen(true);
      updatePosition();
      return;
    }
    if (!$isRangeSelection(selection)) {
      cellKeyRef.current = null;
      setOpen(false);
      return;
    }
    const anchor = selection.anchor.getNode();
    const cell = getCellFromAnchor(anchor);
    if (cell) {
      cellKeyRef.current = cell.getKey();
      setCanMerge(false);
      setCanUnmerge(cell.getColSpan() > 1 || cell.getRowSpan() > 1);
      setOpen(true);
      updatePosition();
    } else {
      cellKeyRef.current = null;
      setOpen(false);
    }
  }, [updatePosition]);

  useEffect(() => {
    if (!open) return;
    const onScroll = () => updatePosition();
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
    };
  }, [open, updatePosition]);

  const withCell = useCallback((fn) => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection) && !$isTableSelection(selection)) return;
      const anchorNode = $isTableSelection(selection)
        ? selection.getNodes().find($isTableCellNode)
        : selection.anchor.getNode();
      if (!anchorNode) return;
      const cell = $isTableCellNode(anchorNode)
        ? anchorNode
        : $getTableCellNodeFromLexicalNode(anchorNode);
      if (!cell) return;
      fn(cell);
    });
  }, [editor]);

  const insertRowAbove = () => withCell(() => $insertTableRow__EXPERIMENTAL(false));
  const insertRowBelow = () => withCell(() => $insertTableRow__EXPERIMENTAL(true));
  const deleteRow = () => withCell(() => $deleteTableRow__EXPERIMENTAL());
  const insertColBefore = () => withCell(() => $insertTableColumn__EXPERIMENTAL(false));
  const insertColAfter = () => withCell(() => $insertTableColumn__EXPERIMENTAL(true));
  const deleteCol = () => withCell(() => $deleteTableColumn__EXPERIMENTAL());
  const deleteTable = () => withCell((cell) => {
    const table = $getTableNodeFromLexicalNodeOrThrow(cell);
    table.remove();
  });

  const mergeCells = () => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isTableSelection(selection)) return;
      const selectedCells = selection.getNodes().filter($isTableCellNode);
      if (selectedCells.length < 2) return;

      // Walk the actual table grid (which accounts for existing col/row spans)
      // instead of trusting selection.getShape() + the cell list alone. When
      // the selection already contains a merged cell, getShape()'s rectangle
      // can exceed the count of distinct cells returned by getNodes(), and
      // the simple "set span to toX-fromX+1" math produces broken HTML.
      const anchor = selectedCells[0];
      const table = $getTableNodeFromLexicalNodeOrThrow(anchor);
      // SkipCellCheck because we only need the table map — not the anchor/focus
      // positions it would otherwise validate, and passing the same cell twice
      // to the validating version trips that check.
      const [map] = $computeTableMapSkipCellCheck(table, anchor, anchor);

      // Expand the selected rectangle to the minimum rectangle that fully
      // contains every selected cell and all of each selected cell's own span.
      const selectedSet = new Set(selectedCells.map((c) => c.getKey()));
      let fromRow = Infinity, toRow = -1, fromCol = Infinity, toCol = -1;
      for (let r = 0; r < map.length; r++) {
        for (let c = 0; c < map[r].length; c++) {
          const entry = map[r][c];
          if (!entry || !selectedSet.has(entry.cell.getKey())) continue;
          fromRow = Math.min(fromRow, r);
          fromCol = Math.min(fromCol, c);
          toRow = Math.max(toRow, r + entry.cell.getRowSpan() - 1);
          toCol = Math.max(toCol, c + entry.cell.getColSpan() - 1);
        }
      }
      if (toRow < 0) return;

      // Target = the cell at the top-left of the rectangle.
      const target = map[fromRow][fromCol].cell;
      const targetKey = target.getKey();

      // Collect every distinct cell inside the rectangle (each cell appears in
      // the map once per covered slot; dedupe by key). Cells with spans that
      // already reach outside the rectangle are excluded from the merge so we
      // don't accidentally swallow them.
      const absorbed = new Map();
      for (let r = fromRow; r <= toRow; r++) {
        for (let c = fromCol; c <= toCol; c++) {
          const entry = map[r]?.[c];
          if (!entry) continue;
          const cell = entry.cell;
          if (cell.getKey() === targetKey) continue;
          if (absorbed.has(cell.getKey())) continue;
          // Skip cells that straddle the rectangle boundary (shouldn't happen
          // if the user selected a clean rectangle, but defensive).
          const cellRow = r;
          const cellCol = c;
          const cellToRow = cellRow + cell.getRowSpan() - 1;
          const cellToCol = cellCol + cell.getColSpan() - 1;
          if (cellToRow > toRow || cellToCol > toCol) continue;
          absorbed.set(cell.getKey(), cell);
        }
      }

      // Move each absorbed cell's children into the target, then remove it.
      // Rows that end up empty after this are intentionally kept — they are
      // still covered by the target's new rowspan and serve as layout anchors
      // in both the HTML output and Lexical's table map.
      absorbed.forEach((cell) => {
        cell.getChildren().forEach((child) => target.append(child));
        cell.remove();
      });

      target.setColSpan(toCol - fromCol + 1);
      target.setRowSpan(toRow - fromRow + 1);

      // Header-state normalization: a merged cell that now covers rows below
      // the header row is no longer a row header, and one that extends right
      // of the first column is no longer a column header. Preserve whichever
      // header bits still make sense at the new top-left position.
      let nextHeaderState = TableCellHeaderStates.NO_STATUS;
      if (target.hasHeaderState?.(TableCellHeaderStates.ROW) && fromRow === 0) {
        nextHeaderState |= TableCellHeaderStates.ROW;
      }
      if (target.hasHeaderState?.(TableCellHeaderStates.COLUMN) && fromCol === 0) {
        nextHeaderState |= TableCellHeaderStates.COLUMN;
      }
      target.setHeaderStyles?.(nextHeaderState);
    });
  };

  const unmergeCell = () => {
    editor.update(() => {
      $unmergeCell();
    });
  };

  if (!open || !pos) return null;

  return createPortal(
    <div
      className="wpifycf-field-richtext__popover wpifycf-field-richtext__popover--table-actions"
      style={{ position: 'absolute', top: pos.top, left: pos.left }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <Button icon={tableRowBefore} label={__('Insert row above', 'wpify-custom-fields')} onClick={insertRowAbove} />
      <Button icon={tableRowAfter} label={__('Insert row below', 'wpify-custom-fields')} onClick={insertRowBelow} />
      <Button icon={tableRowDelete} label={__('Delete row', 'wpify-custom-fields')} onClick={deleteRow} />
      <span className="wpifycf-field-richtext__toolbar-separator" aria-hidden="true" />
      <Button icon={tableColumnBefore} label={__('Insert column before', 'wpify-custom-fields')} onClick={insertColBefore} />
      <Button icon={tableColumnAfter} label={__('Insert column after', 'wpify-custom-fields')} onClick={insertColAfter} />
      <Button icon={tableColumnDelete} label={__('Delete column', 'wpify-custom-fields')} onClick={deleteCol} />
      <span className="wpifycf-field-richtext__toolbar-separator" aria-hidden="true" />
      <Button
        icon={MergeIcon}
        label={__('Merge cells', 'wpify-custom-fields')}
        onClick={mergeCells}
        disabled={!canMerge}
      />
      <Button
        icon={UnmergeIcon}
        label={__('Unmerge cell', 'wpify-custom-fields')}
        onClick={unmergeCell}
        disabled={!canUnmerge}
      />
      <span className="wpifycf-field-richtext__toolbar-separator" aria-hidden="true" />
      <Button icon={trashIcon} label={__('Delete table', 'wpify-custom-fields')} onClick={deleteTable} />
    </div>,
    document.body,
  );
}

export default TableActionsPlugin;
