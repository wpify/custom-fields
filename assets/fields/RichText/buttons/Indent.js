import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { formatIndent, formatOutdent } from '@wordpress/icons';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { INDENT_CONTENT_COMMAND, OUTDENT_CONTENT_COMMAND } from 'lexical';

export function IndentButton({ direction, disabled }) {
  const [editor] = useLexicalComposerContext();
  const isIncrease = direction === 'increase';
  return (
    <Button
      className="wpifycf-field-richtext__button"
      icon={isIncrease ? formatIndent : formatOutdent}
      label={isIncrease ? __('Increase indent', 'wpify-custom-fields') : __('Decrease indent', 'wpify-custom-fields')}
      disabled={disabled}
      onClick={() => editor.dispatchCommand(isIncrease ? INDENT_CONTENT_COMMAND : OUTDENT_CONTENT_COMMAND, undefined)}
    />
  );
}
