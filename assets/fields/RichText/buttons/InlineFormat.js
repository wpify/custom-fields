import clsx from 'clsx';
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { formatBold, formatItalic, formatStrikethrough } from '@wordpress/icons';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { FORMAT_TEXT_COMMAND } from 'lexical';

const MAP = {
  bold:          { icon: formatBold,          label: __('Bold', 'wpify-custom-fields'),          format: 'bold' },
  italic:        { icon: formatItalic,        label: __('Italic', 'wpify-custom-fields'),        format: 'italic' },
  strikethrough: { icon: formatStrikethrough, label: __('Strikethrough', 'wpify-custom-fields'), format: 'strikethrough' },
};

export function InlineFormatButton({ kind, active, disabled }) {
  const [editor] = useLexicalComposerContext();
  const spec = MAP[kind];
  if (!spec) return null;
  return (
    <Button
      className={clsx('wpifycf-field-richtext__button', active && 'wpifycf-field-richtext__button--active')}
      icon={spec.icon}
      label={spec.label}
      disabled={disabled}
      onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, spec.format)}
    />
  );
}
