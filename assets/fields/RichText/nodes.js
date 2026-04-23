import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';
import { LinkNode } from '@lexical/link';
import { CodeNode, CodeHighlightNode } from '@lexical/code';
import { HorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode';
import { TableNode, TableRowNode, TableCellNode } from '@lexical/table';
import { WpImageNode } from './nodes/WpImageNode';

// ParagraphNode and TextNode are registered by Lexical core; don't list them here.
// Lexical's built-in importDOM for ParagraphNode/HeadingNode already handles
// `style="text-align: …"` — which is what modern WordPress emits.
export const RICHTEXT_NODES = [
  HeadingNode,
  QuoteNode,
  ListNode,
  ListItemNode,
  LinkNode,
  CodeNode,
  CodeHighlightNode,
  HorizontalRuleNode,
  TableNode,
  TableRowNode,
  TableCellNode,
  WpImageNode,
];
