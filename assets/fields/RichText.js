import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { RawHTML } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { ErrorBoundary } from 'react-error-boundary';
import { AppContext } from '@/components/AppContext';
import { stripHtml } from '@/helpers/functions';
import { checkValidityStringType } from '@/helpers/validators';
import { LexicalContainer, EditorBody } from './RichText/Editor';
import { Toolbar } from './RichText/Toolbar';
import { CodeView } from './RichText/CodeView';
import { Counter } from './RichText/Counter';
import { Notice } from './RichText/Notice';
import { resolveToolbar, VIEW_VISUAL, VIEW_CODE } from './RichText/config';
import { HtmlSyncPlugin, serializeEditorToHtml, loadHtmlIntoEditor } from './RichText/plugins/HtmlSyncPlugin';
import { PasteAsTextPlugin } from './RichText/plugins/PasteAsTextPlugin';
import { WordCountPlugin, countWords, countCharacters } from './RichText/plugins/WordCountPlugin';
import { LinkPopoverPlugin } from './RichText/plugins/LinkPopoverPlugin';
import { TableActionsPlugin } from './RichText/plugins/TableActionsPlugin';
import { ImagePlugin } from './RichText/plugins/ImagePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

// Suppress a dev-only React warning emitted by Lexical 0.21's RichTextPlugin.
// The plugin renders `<>contentEditable, Placeholder, decorators</>` where
// `decorators` is an array without keys — fixed nowhere through 0.43.
//
// WordPress ships a *development* React build (react.js, not react.min.js) so
// this warning fires even when our own bundle is minified. We match two cases:
//
//   1. Unminified Lexical (`LexicalRichTextPlugin` component frame), for the
//      rare case someone runs the plugin's dev build against WP's dev React.
//   2. Our minified production bundle, where the component name is mangled to
//      a 1–3 char identifier. We only inspect the *first* stack frame so a
//      legitimate key warning from our own code deep in the tree isn't hidden
//      just because our bundle appears somewhere in its call stack.
//
// Known tradeoff: if one of our own components is minified to a 1–3 char name
// AND emits a genuine key warning from its top render frame, that warning will
// be dropped too. This is dev-only noise suppression; the cost is acceptable
// versus the alternative of spamming the console on every mount. Warnings
// from any third-party library and from our own components with longer
// minified names (or unminified dev builds) still surface.
if (typeof console !== 'undefined' && !console.__wpifycfRichtextPatched) {
  const origError = console.error;
  // Match "    at <1-3 char minified name> (.../wpify-custom-fields.js...)" on
  // the first line of the stack trace only. The first frame identifies the
  // component that *directly* emitted unkeyed children, which in Lexical is
  // RichTextPlugin. Any deeper match means the bug is elsewhere.
  const LEXICAL_KEY_WARN_FIRST_FRAME =
    /^\s*at\s+[A-Za-z_$][A-Za-z_$0-9]{0,2}\s+\([^)]*wpify-custom-fields\.js\b/;
  console.error = function (...args) {
    const msg = typeof args[0] === 'string' ? args[0] : '';
    if (msg.indexOf('unique "key" prop') !== -1) {
      const stack = typeof args[1] === 'string' ? args[1] : '';
      // React stack traces are newline-separated; the leading blank line is
      // skipped by trimStart so the first frame really is the first non-empty
      // line.
      const firstLine = stack.trimStart().split('\n', 1)[0] || '';
      if (
        /\bat LexicalRichTextPlugin\b/.test(stack) ||
        LEXICAL_KEY_WARN_FIRST_FRAME.test(firstLine)
      ) {
        return;
      }
    }
    return origError.apply(console, args);
  };
  console.__wpifycfRichtextPatched = true;
}

function EditorBridge({ value, onChange, armedRef, onPasteFired, onLexicalErrorRuntime, onCounts, onExposeEditor, onOpenLinkRef, paused }) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => { onExposeEditor?.(editor); }, [editor, onExposeEditor]);
  return (
    <>
      <HtmlSyncPlugin value={value} onChange={onChange} onError={onLexicalErrorRuntime} paused={paused} />
      <PasteAsTextPlugin armedRef={armedRef} onFired={onPasteFired} />
      <WordCountPlugin onChange={onCounts} />
      <LinkPopoverPlugin requestOpen={onOpenLinkRef} />
      <TableActionsPlugin />
      <ImagePlugin />
    </>
  );
}

function EventIsolationWrapper({ children, className }) {
  const stop = useCallback((e) => e.stopPropagation(), []);
  const onMouseUp = useCallback((e) => { e.stopPropagation(); window.dispatchEvent(new MouseEvent('mouseup')); }, []);
  const onKeyDown = useCallback((e) => { if (e.key !== 'Tab' && e.key !== 'Escape') e.stopPropagation(); }, []);
  return (
    <div
      className={clsx('wpifycf-event-isolation-wrapper', className)}
      onMouseDown={stop}
      onMouseUp={onMouseUp}
      onClick={stop}
      onKeyDown={onKeyDown}
      onFocus={stop}
    >
      {children}
    </div>
  );
}

export function RichText({
  id,
  value,
  onChange,
  height = 300,
  className,
  disabled = false,
  setTitle,
  toolbar = 'full',
  word_count: wordCountProp = true,
  default_view: defaultView = VIEW_VISUAL,
}) {
  const { context } = useContext(AppContext);
  const resolvedToolbar = resolveToolbar(toolbar);
  const hasViewToggle = resolvedToolbar.includes('view:toggle-code');
  const [view, setView] = useState(hasViewToggle && defaultView === VIEW_CODE ? VIEW_CODE : VIEW_VISUAL);
  const [notice, setNotice] = useState(null);
  const [counts, setCounts] = useState({ words: 0, characters: 0, charactersWithSpaces: 0 });
  const [armedPasteAsText, setArmedPasteAsText] = useState(false);
  const armedRef = useRef(false);
  const editorRef = useRef(null);
  const openLinkRef = useRef(null);
  // Code-view buffer: string that the user is typing in code view but has not yet synced to editor.
  const [codeBuffer, setCodeBuffer] = useState(value || '');

  // Reset code buffer when external value changes while in visual view.
  useEffect(() => {
    if (view === VIEW_VISUAL) setCodeBuffer(value || '');
  }, [value, view]);

  // Keep title updated.
  useEffect(() => {
    setTitle?.(stripHtml(value || '').replace(/\n/g, ' ').substring(0, 50));
  }, [setTitle, value]);

  // Keep armedRef in sync with state.
  useEffect(() => { armedRef.current = armedPasteAsText; }, [armedPasteAsText]);

  // Stable ref to onChange so effects don't refire on every parent render.
  const onChangeRef = useRef(onChange);
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  const onPasteFired = useCallback(() => setArmedPasteAsText(false), []);
  const onTogglePasteAsText = useCallback(() => setArmedPasteAsText((v) => !v), []);
  const onOpenLink = useCallback(() => { openLinkRef.current?.(); }, []);
  const onExposeEditor = useCallback((ed) => { editorRef.current = ed; }, []);
  const noop = useCallback(() => {}, []);
  const onCountsHandler = view === VIEW_VISUAL ? setCounts : noop;

  const onToggleView = useCallback(() => {
    if (view === VIEW_VISUAL) {
      const html = editorRef.current ? serializeEditorToHtml(editorRef.current) : (value || '');
      setCodeBuffer(html);
      setView(VIEW_CODE);
      setNotice(null);
    } else {
      const source = codeBuffer;
      try {
        if (editorRef.current) {
          loadHtmlIntoEditor(editorRef.current, source);
          const normalized = serializeEditorToHtml(editorRef.current);
          const trimA = (source || '').trim();
          const trimB = (normalized || '').trim();
          if (trimA && trimA !== trimB) {
            setNotice({
              variant: 'info',
              message: __('Some HTML was normalized by the editor.', 'wpify-custom-fields'),
              details: { source, normalized },
            });
          } else {
            setNotice(null);
          }
          onChange?.(normalized);
        }
        setView(VIEW_VISUAL);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[richtext] code→visual parse failed', err);
        setNotice({
          variant: 'error',
          message: __('The editor could not parse the HTML.', 'wpify-custom-fields'),
        });
      }
    }
  }, [view, codeBuffer, value, onChange]);

  // Update counts while in code view based on stripped HTML text.
  useEffect(() => {
    if (view !== VIEW_CODE) return;
    const text = stripHtml(codeBuffer || '');
    setCounts({
      words: countWords(text),
      characters: countCharacters(text, false),
      charactersWithSpaces: countCharacters(text, true),
    });
  }, [view, codeBuffer]);

  // Sync code buffer edits back to hidden input via onChange (only when in code view).
  useEffect(() => {
    if (view !== VIEW_CODE) return;
    onChangeRef.current?.(codeBuffer);
  }, [view, codeBuffer]);

  const onLexicalError = useCallback(() => {
    setNotice({
      variant: 'error',
      message: __('The editor could not parse the HTML. You can edit it as raw HTML instead.', 'wpify-custom-fields'),
      actionLabel: hasViewToggle ? __('Switch to code view', 'wpify-custom-fields') : null,
      onAction: hasViewToggle ? () => setView(VIEW_CODE) : null,
    });
  }, [hasViewToggle]);

  if (disabled) {
    return (
      <div className={clsx('wpifycf-field-richtext', `wpifycf-field-richtext--${id}`, 'wpifycf-field-richtext--disabled', className)}>
        <RawHTML className="wpifycf-field-richtext__raw">{value || ''}</RawHTML>
      </div>
    );
  }

  const inner = (
    <LexicalContainer disabled={disabled} onLexicalError={onLexicalError}>
      <Toolbar
        toolbar={resolvedToolbar}
        view={view}
        armedPasteAsText={armedPasteAsText}
        onTogglePasteAsText={onTogglePasteAsText}
        onToggleView={onToggleView}
        onOpenLink={onOpenLink}
        disabled={disabled}
      />
      {notice && (
        <Notice
          variant={notice.variant}
          message={notice.message}
          details={notice.details}
          actionLabel={notice.actionLabel}
          onAction={notice.onAction}
          onDismiss={() => setNotice(null)}
        />
      )}
      <div className="wpifycf-field-richtext__body">
        <div style={{ display: view === VIEW_VISUAL ? 'block' : 'none' }}>
          <EditorBody height={height} />
        </div>
        {view === VIEW_CODE && (
          <CodeView
            value={codeBuffer}
            onChange={setCodeBuffer}
            height={height}
          />
        )}
      </div>
      {wordCountProp && (
        <div className="wpifycf-field-richtext__footer">
          <Counter
            words={counts.words}
            characters={counts.characters}
            charactersWithSpaces={counts.charactersWithSpaces}
          />
        </div>
      )}
      <EditorBridge
        value={value}
        onChange={onChange}
        paused={view !== VIEW_VISUAL}
        armedRef={armedRef}
        onPasteFired={onPasteFired}
        onLexicalErrorRuntime={onLexicalError}
        onCounts={onCountsHandler}
        onExposeEditor={onExposeEditor}
        onOpenLinkRef={openLinkRef}
      />
    </LexicalContainer>
  );

  const body = context === 'gutenberg'
    ? <EventIsolationWrapper>{inner}</EventIsolationWrapper>
    : inner;

  return (
    <ErrorBoundary
      fallback={(
        <textarea
          className="wpifycf-field-richtext__editor-fallback"
          value={value || ''}
          onChange={(e) => onChange?.(e.target.value)}
          style={{ width: '100%', height: (height + 100) + 'px' }}
        />
      )}
    >
      <div
        className={clsx(
          'wpifycf-field-richtext',
          `wpifycf-field-richtext--${id}`,
          view === VIEW_CODE ? 'wpifycf-field-richtext--view-code' : 'wpifycf-field-richtext--view-visual',
          className,
        )}
      >
        {body}
      </div>
    </ErrorBoundary>
  );
}

RichText.checkValidity = checkValidityStringType;
RichText.VIEW_VISUAL = VIEW_VISUAL;
RichText.VIEW_CODE = VIEW_CODE;

export default RichText;
