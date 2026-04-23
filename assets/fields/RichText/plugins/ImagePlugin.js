import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { image as imageIcon, edit as editIcon, trash as trashIcon } from '@wordpress/icons';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getNodeByKey,
  $getSelection,
  $insertNodes,
  $isNodeSelection,
  $isRootOrShadowRoot,
  COMMAND_PRIORITY_EDITOR,
} from 'lexical';
import { $wrapNodeInElement } from '@lexical/utils';
import { $createParagraphNode } from 'lexical';
import { useMediaLibrary } from '@/helpers/hooks';
import { useSelectionSubscription } from '../useSelectionSubscription';
import {
  $createWpImageNode,
  $isWpImageNode,
  INSERT_IMAGE_COMMAND,
} from '../nodes/WpImageNode';
import useFloatingAnchor from '../useFloatingAnchor';
import { pickBestSize } from '../imageSizes';

export function ImagePlugin() {
  const [editor] = useLexicalComposerContext();
  const [selectedKey, setSelectedKey] = useState(null);
  const [anchorKey, setAnchorKey] = useState(0);
  const [altDraft, setAltDraft] = useState('');
  const [editingAlt, setEditingAlt] = useState(false);
  const altInputRef = useRef(null);

  // Register command: insert image at current selection.
  useEffect(() => {
    return editor.registerCommand(
      INSERT_IMAGE_COMMAND,
      (payload) => {
        if (!payload || !payload.src) return false;
        const node = $createWpImageNode(payload);
        $insertNodes([node]);
        if ($isRootOrShadowRoot(node.getParentOrThrow())) {
          $wrapNodeInElement(node, $createParagraphNode).selectEnd();
        }
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );
  }, [editor]);

  // Track whether the current selection is a single WpImageNode.
  useSelectionSubscription(() => {
    const selection = $getSelection();
    if (!$isNodeSelection(selection)) {
      setSelectedKey(null);
      return;
    }
    const nodes = selection.getNodes();
    if (nodes.length === 1 && $isWpImageNode(nodes[0])) {
      const key = nodes[0].getKey();
      setSelectedKey(key);
      setAltDraft(nodes[0].getAlt() || '');
      setAnchorKey((n) => n + 1);
    } else {
      setSelectedKey(null);
    }
  });

  // When no image is selected, clear the inline alt editor.
  useEffect(() => {
    if (!selectedKey) setEditingAlt(false);
  }, [selectedKey]);

  const pos = useFloatingAnchor(
    () => {
      if (!selectedKey) return null;
      const el = editor.getElementByKey(selectedKey);
      const img = el?.querySelector('img');
      const rect = (img || el)?.getBoundingClientRect();
      return rect || null;
    },
    { open: !!selectedKey, anchorKey },
  );

  const close = useCallback(() => {
    setEditingAlt(false);
  }, []);

  useEffect(() => {
    if (!selectedKey) return;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        close();
        editor.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [selectedKey, close, editor]);

  useEffect(() => {
    if (editingAlt && altInputRef.current) {
      altInputRef.current.focus();
      altInputRef.current.select();
    }
  }, [editingAlt]);

  // Use a ref so the media-library onSelect callback (called asynchronously
  // after the modal closes) always reads the currently-selected key, not a
  // stale one captured at hook-init time.
  const selectedKeyRef = useRef(null);
  useEffect(() => { selectedKeyRef.current = selectedKey; }, [selectedKey]);

  const openReplaceMediaLibrary = useMediaLibrary({
    multiple: false,
    type: 'image',
    title: __('Replace image', 'wpify-custom-fields'),
    button: __('Replace', 'wpify-custom-fields'),
    onSelect: (attachment) => {
      const key = selectedKeyRef.current;
      if (!key) return;
      const size = pickBestSize(attachment);
      if (!size?.url) return;
      editor.update(() => {
        const node = $getNodeByKey(key);
        if ($isWpImageNode(node)) {
          node.setAttachment({
            src: size.url,
            alt: attachment.alt || node.getAlt(),
            width: size.width || null,
            height: size.height || null,
            attachmentId: attachment.id || null,
          });
        }
      });
    },
  });

  const handleReplace = useCallback(() => {
    if (!selectedKey) return;
    openReplaceMediaLibrary();
  }, [selectedKey, openReplaceMediaLibrary]);

  const commitAlt = useCallback(() => {
    if (!selectedKey) return;
    editor.update(() => {
      const node = $getNodeByKey(selectedKey);
      if ($isWpImageNode(node)) node.setAlt(altDraft);
    });
    setEditingAlt(false);
  }, [editor, selectedKey, altDraft]);

  const handleDelete = useCallback(() => {
    if (!selectedKey) return;
    editor.update(() => {
      const node = $getNodeByKey(selectedKey);
      if ($isWpImageNode(node)) node.remove();
    });
    setEditingAlt(false);
    setSelectedKey(null);
  }, [editor, selectedKey]);

  if (!selectedKey || !pos) return null;

  return createPortal(
    <div
      className="wpifycf-field-richtext__popover wpifycf-field-richtext__popover--image"
      style={{ position: 'absolute', top: pos.top, left: pos.left }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <Button icon={imageIcon} label={__('Replace image', 'wpify-custom-fields')} onClick={handleReplace} />
      {editingAlt ? (
        <input
          ref={altInputRef}
          type="text"
          className="wpifycf-field-richtext__popover-input"
          value={altDraft}
          placeholder={__('Alt text', 'wpify-custom-fields')}
          onChange={(e) => setAltDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); commitAlt(); }
            if (e.key === 'Escape') { e.preventDefault(); setEditingAlt(false); }
          }}
          onBlur={commitAlt}
        />
      ) : (
        <Button
          icon={editIcon}
          label={__('Edit alt text', 'wpify-custom-fields')}
          onClick={() => setEditingAlt(true)}
        />
      )}
      <span className="wpifycf-field-richtext__toolbar-separator" aria-hidden="true" />
      <Button icon={trashIcon} label={__('Delete image', 'wpify-custom-fields')} onClick={handleDelete} />
    </div>,
    document.body,
  );
}

export default ImagePlugin;
