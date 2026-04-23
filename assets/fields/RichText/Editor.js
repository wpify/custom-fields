import { useMemo } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin';
import { HorizontalRulePlugin } from '@lexical/react/LexicalHorizontalRulePlugin';
import { TablePlugin } from '@lexical/react/LexicalTablePlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { RICHTEXT_NODES } from './nodes';

const theme = {
  paragraph: 'wpifycf-richtext-paragraph',
  heading: {
    h1: 'wpifycf-richtext-h1', h2: 'wpifycf-richtext-h2', h3: 'wpifycf-richtext-h3',
    h4: 'wpifycf-richtext-h4', h5: 'wpifycf-richtext-h5', h6: 'wpifycf-richtext-h6',
  },
  list: {
    ul: 'wpifycf-richtext-ul',
    ol: 'wpifycf-richtext-ol',
    listitem: 'wpifycf-richtext-li',
  },
  quote: 'wpifycf-richtext-blockquote',
  link: 'wpifycf-richtext-link',
  image: 'wpifycf-richtext-image',
  table: 'wpifycf-richtext-table',
  tableRow: 'wpifycf-richtext-table__row',
  tableCell: 'wpifycf-richtext-table__cell',
  tableCellHeader: 'wpifycf-richtext-table__cell-header',
  tableCellSelected: 'wpifycf-richtext-table__cell--selected',
  tableSelected: 'wpifycf-richtext-table--selected',
  tableSelection: 'wpifycf-richtext-table__selection',
  text: {
    bold: 'wpifycf-richtext-bold',
    italic: 'wpifycf-richtext-italic',
    strikethrough: 'wpifycf-richtext-strikethrough',
    underline: 'wpifycf-richtext-underline',
  },
};

/**
 * LexicalContainer — provides the LexicalComposer context. Caller renders
 * toolbar, body, footer, and extra plugins as children; all of them share
 * the same editor instance.
 */
export function LexicalContainer({ children, disabled, onLexicalError }) {
  const initialConfig = useMemo(() => ({
    namespace: 'wpifycf-richtext',
    theme,
    nodes: RICHTEXT_NODES,
    editable: !disabled,
    onError: (err) => {
      // eslint-disable-next-line no-console
      console.error('[richtext] lexical error', err);
      onLexicalError?.(err);
    },
  }), [disabled, onLexicalError]);

  return (
    <LexicalComposer initialConfig={initialConfig}>
      {children}
    </LexicalComposer>
  );
}

/**
 * EditorBody — ContentEditable plus the core Lexical plugins. Must be
 * rendered inside <LexicalContainer>.
 */
export function EditorBody({ height }) {
  return (
    <div className="wpifycf-field-richtext__editor" style={{ minHeight: height }}>
      <RichTextPlugin
        contentEditable={
          <ContentEditable
            className="wpifycf-field-richtext__content"
            style={{ minHeight: height }}
            data-gramm="false"
            data-gramm_editor="false"
            data-enable-grammarly="false"
            spellCheck={false}
          />
        }
        placeholder={<div className="wpifycf-field-richtext__placeholder" />}
        ErrorBoundary={LexicalErrorBoundary}
      />
      <HistoryPlugin />
      <LinkPlugin />
      <ListPlugin />
      <TabIndentationPlugin />
      <HorizontalRulePlugin />
      <TablePlugin hasCellMerge hasCellBackgroundColor hasTabHandler />
    </div>
  );
}
