import { __ } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';

export const VIEW_VISUAL = 'visual';
export const VIEW_CODE = 'code';

export const BLOCK_IDS = [
  'block:paragraph',
  'block:h1', 'block:h2', 'block:h3', 'block:h4', 'block:h5', 'block:h6',
  'block:pre', 'block:code-block',
  'block:blockquote',
];

export const SEPARATOR = '|';

const DEFAULT_PRESETS = {
  full: [
    'block:paragraph', 'block:h1', 'block:h2', 'block:h3', 'block:h4', 'block:h5', 'block:h6',
    'block:pre', 'block:code-block',
    '|',
    'format:bold', 'format:italic', 'format:strikethrough',
    '|',
    'list:ul', 'list:ol', 'block:blockquote',
    '|',
    'align:left', 'align:center', 'align:right', 'align:justify',
    '|',
    'insert:link', 'insert:hr', 'insert:image', 'insert:table',
    '|',
    'indent:decrease', 'indent:increase',
    '|',
    'action:paste-as-text', 'action:clear-formatting', 'insert:special-char',
    '|',
    'history:undo', 'history:redo',
    '|',
    'view:toggle-code',
  ],
  basic: [
    'block:paragraph', 'block:h2', 'block:h3',
    '|',
    'format:bold', 'format:italic',
    '|',
    'list:ul', 'list:ol',
    '|',
    'insert:link',
    '|',
    'history:undo', 'history:redo',
  ],
  minimal: [
    'format:bold', 'format:italic',
    '|',
    'insert:link',
  ],
};

export function getPresets() {
  return applyFilters('wpifycf_richtext_toolbar_presets', { ...DEFAULT_PRESETS });
}

export function resolveToolbar(toolbar) {
  const presets = getPresets();
  if (Array.isArray(toolbar)) return toolbar;
  if (typeof toolbar === 'string' && presets[toolbar]) return presets[toolbar];
  return presets.full;
}

const DEFAULT_SPECIAL_CHARS = [
  // Marks
  { char: '©', label: __('Copyright', 'wpify-custom-fields') },
  { char: '®', label: __('Registered', 'wpify-custom-fields') },
  { char: '™', label: __('Trademark', 'wpify-custom-fields') },
  { char: '§', label: __('Section', 'wpify-custom-fields') },
  { char: '¶', label: __('Pilcrow', 'wpify-custom-fields') },
  { char: '•', label: __('Bullet', 'wpify-custom-fields') },
  { char: '·', label: __('Middle dot', 'wpify-custom-fields') },
  { char: '…', label: __('Ellipsis', 'wpify-custom-fields') },
  // Punctuation
  { char: '–', label: __('En dash', 'wpify-custom-fields') },
  { char: '—', label: __('Em dash', 'wpify-custom-fields') },
  { char: '“', label: __('Left double quote', 'wpify-custom-fields') },
  { char: '”', label: __('Right double quote', 'wpify-custom-fields') },
  { char: '‘', label: __('Left single quote', 'wpify-custom-fields') },
  { char: '’', label: __('Right single quote', 'wpify-custom-fields') },
  { char: '«', label: __('Left guillemet', 'wpify-custom-fields') },
  { char: '»', label: __('Right guillemet', 'wpify-custom-fields') },
  { char: '‹', label: __('Left single guillemet', 'wpify-custom-fields') },
  { char: '›', label: __('Right single guillemet', 'wpify-custom-fields') },
  { char: '„', label: __('Double low quote', 'wpify-custom-fields') },
  { char: '‚', label: __('Single low quote', 'wpify-custom-fields') },
  // Arrows
  { char: '←', label: __('Left arrow', 'wpify-custom-fields') },
  { char: '→', label: __('Right arrow', 'wpify-custom-fields') },
  { char: '↑', label: __('Up arrow', 'wpify-custom-fields') },
  { char: '↓', label: __('Down arrow', 'wpify-custom-fields') },
  { char: '↔', label: __('Left-right arrow', 'wpify-custom-fields') },
  { char: '⇐', label: __('Double left arrow', 'wpify-custom-fields') },
  { char: '⇒', label: __('Double right arrow', 'wpify-custom-fields') },
  // Math
  { char: '×', label: __('Multiplication', 'wpify-custom-fields') },
  { char: '÷', label: __('Division', 'wpify-custom-fields') },
  { char: '±', label: __('Plus-minus', 'wpify-custom-fields') },
  { char: '≈', label: __('Approximately', 'wpify-custom-fields') },
  { char: '≠', label: __('Not equal', 'wpify-custom-fields') },
  { char: '≤', label: __('Less than or equal', 'wpify-custom-fields') },
  { char: '≥', label: __('Greater than or equal', 'wpify-custom-fields') },
  { char: '∞', label: __('Infinity', 'wpify-custom-fields') },
  // Currencies
  { char: '€', label: __('Euro', 'wpify-custom-fields') },
  { char: '£', label: __('Pound', 'wpify-custom-fields') },
  { char: '¥', label: __('Yen', 'wpify-custom-fields') },
  { char: '¢', label: __('Cent', 'wpify-custom-fields') },
  { char: '₹', label: __('Rupee', 'wpify-custom-fields') },
  { char: '₽', label: __('Ruble', 'wpify-custom-fields') },
];

export function getSpecialChars() {
  return applyFilters('wpifycf_richtext_special_chars', DEFAULT_SPECIAL_CHARS.slice());
}

export const HEADING_LABELS = {
  paragraph: __('Paragraph', 'wpify-custom-fields'),
  h1: __('Heading 1', 'wpify-custom-fields'),
  h2: __('Heading 2', 'wpify-custom-fields'),
  h3: __('Heading 3', 'wpify-custom-fields'),
  h4: __('Heading 4', 'wpify-custom-fields'),
  h5: __('Heading 5', 'wpify-custom-fields'),
  h6: __('Heading 6', 'wpify-custom-fields'),
  pre: __('Preformatted', 'wpify-custom-fields'),
  'code-block': __('Code block', 'wpify-custom-fields'),
  blockquote: __('Blockquote', 'wpify-custom-fields'),
};
