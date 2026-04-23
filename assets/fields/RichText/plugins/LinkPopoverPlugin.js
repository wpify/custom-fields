import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection, $isRangeSelection, SELECTION_CHANGE_COMMAND, COMMAND_PRIORITY_LOW } from 'lexical';
import { TOGGLE_LINK_COMMAND, LinkNode } from '@lexical/link';
import { $getNearestNodeOfType, mergeRegister } from '@lexical/utils';
import useFloatingAnchor from '../useFloatingAnchor';

export function LinkPopoverPlugin({ requestOpen }) {
  const [editor] = useLexicalComposerContext();
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [newTab, setNewTab] = useState(false);
  const [anchorKey, setAnchorKey] = useState(0);
  const selectionRectRef = useRef(null);

  const close = useCallback(() => {
    setOpen(false);
    setUrl('');
    setNewTab(false);
  }, []);

  const readCurrentLink = useCallback(() => {
    let link = null;
    editor.read(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;
      const node = selection.anchor.getNode();
      const linkNode = $getNearestNodeOfType(node, LinkNode);
      if (linkNode) {
        link = {
          url: linkNode.getURL() || '',
          newTab: linkNode.getTarget() === '_blank',
        };
      }
    });
    return link;
  }, [editor]);

  const captureSelectionRect = useCallback(() => {
    const domSelection = window.getSelection();
    if (domSelection && domSelection.rangeCount > 0) {
      selectionRectRef.current = domSelection.getRangeAt(0).getBoundingClientRect();
      setAnchorKey((n) => n + 1);
    }
  }, []);

  const openPopover = useCallback(() => {
    const current = readCurrentLink();
    setUrl(current?.url ?? '');
    setNewTab(current?.newTab ?? false);
    captureSelectionRect();
    setOpen(true);
  }, [readCurrentLink, captureSelectionRect]);

  useEffect(() => {
    if (!requestOpen) return;
    const fn = () => openPopover();
    requestOpen.current = fn;
    return () => { if (requestOpen.current === fn) requestOpen.current = null; };
  }, [requestOpen, openPopover]);

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(SELECTION_CHANGE_COMMAND, () => {
        editor.read(() => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) return;
          const node = selection.anchor.getNode();
          const linkNode = $getNearestNodeOfType(node, LinkNode);
          if (linkNode) {
            setUrl(linkNode.getURL() || '');
            setNewTab(linkNode.getTarget() === '_blank');
            captureSelectionRect();
            setOpen(true);
          } else {
            close();
          }
        });
        return false;
      }, COMMAND_PRIORITY_LOW),
    );
  }, [editor, captureSelectionRect, close]);

  const pos = useFloatingAnchor(
    () => selectionRectRef.current,
    { open, anchorKey },
  );

  const save = useCallback(() => {
    if (!url) { close(); return; }
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, {
      url,
      target: newTab ? '_blank' : null,
      rel: newTab ? 'noopener noreferrer' : null,
    });
    close();
  }, [editor, url, newTab, close]);

  const remove = useCallback(() => {
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    close();
  }, [editor, close]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    const onClickOutside = (e) => {
      if (!e.target.closest('.wpifycf-field-richtext__popover')) close();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClickOutside);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClickOutside);
    };
  }, [open, close]);

  if (!open || !pos) return null;

  return createPortal(
    <div
      className="wpifycf-field-richtext__popover wpifycf-field-richtext__popover--link"
      style={{ position: 'absolute', top: pos.top, left: pos.left }}
    >
      <label className="wpifycf-field-richtext__popover-field">
        <span>{__('URL', 'wpify-custom-fields')}</span>
        <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} autoFocus />
      </label>
      <label className="wpifycf-field-richtext__popover-checkbox">
        <input type="checkbox" checked={newTab} onChange={(e) => setNewTab(e.target.checked)} />
        <span>{__('Open in new tab', 'wpify-custom-fields')}</span>
      </label>
      <div className="wpifycf-field-richtext__popover-actions">
        <Button variant="primary" onClick={save}>{__('Save', 'wpify-custom-fields')}</Button>
        <Button variant="tertiary" onClick={remove}>{__('Remove', 'wpify-custom-fields')}</Button>
        <Button variant="tertiary" onClick={close}>{__('Cancel', 'wpify-custom-fields')}</Button>
      </div>
    </div>,
    document.body,
  );
}

export default LinkPopoverPlugin;
