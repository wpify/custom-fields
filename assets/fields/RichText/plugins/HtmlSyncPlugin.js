import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { $getRoot, $insertNodes } from 'lexical';

// Per-editor "last value we synced with the outside world" — shared between the
// plugin's load/emit effects and the manual load-path in onToggleView so the
// two can't double-load each other. Keyed by editor instance; the editor's own
// lifecycle (unmount) cleans everything up.
const lastSyncedByEditor = new WeakMap();

export function getLastSynced(editor) {
  return lastSyncedByEditor.has(editor) ? lastSyncedByEditor.get(editor) : null;
}

export function setLastSynced(editor, value) {
  lastSyncedByEditor.set(editor, value || '');
}

function htmlToNodes(editor, html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html || '', 'text/html');
  return $generateNodesFromDOM(editor, doc);
}

function isEmptyExport(html) {
  const trimmed = (html || '').trim();
  return trimmed === '' || trimmed === '<p><br></p>' || trimmed === '<p></p>';
}

export function serializeEditorToHtml(editor) {
  let html = '';
  editor.read(() => {
    html = $generateHtmlFromNodes(editor, null);
  });
  return isEmptyExport(html) ? '' : html;
}

export function loadHtmlIntoEditor(editor, html) {
  editor.update(
    () => {
      const root = $getRoot();
      root.clear();
      if (!html) return;
      const nodes = htmlToNodes(editor, html);
      root.select();
      $insertNodes(nodes);
    },
    // Run synchronously so serializeEditorToHtml below sees the committed
    // state; otherwise the read picks up the previous root and we store
    // stale HTML as the "last synced" marker.
    { discrete: true },
  );
  // Record the *normalized* output (what Lexical actually serializes) so the
  // plugin's inbound-sync effect doesn't fire a second load when the parent
  // echoes back a value that differs from the raw input (e.g. `<b>` → `<strong>`).
  setLastSynced(editor, serializeEditorToHtml(editor));
}

export function HtmlSyncPlugin({ value, onChange, onError, paused = false }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (paused) return;
    if (getLastSynced(editor) === (value || '')) return;
    try {
      loadHtmlIntoEditor(editor, value || '');
    } catch (err) {
      onError?.(err);
    }
  }, [editor, value, onError, paused]);

  useEffect(() => {
    if (paused) return undefined;
    return editor.registerUpdateListener(({ dirtyElements, dirtyLeaves }) => {
      if (!dirtyElements.size && !dirtyLeaves.size) return;
      const html = serializeEditorToHtml(editor);
      if (html === getLastSynced(editor)) return;
      setLastSynced(editor, html);
      onChange?.(html);
    });
  }, [editor, onChange, paused]);

  return null;
}

export default HtmlSyncPlugin;
