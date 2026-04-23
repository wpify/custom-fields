import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { separator as separatorIcon } from '@wordpress/icons';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { INSERT_HORIZONTAL_RULE_COMMAND } from '@lexical/react/LexicalHorizontalRuleNode';

export function HorizontalRuleButton({ disabled }) {
  const [editor] = useLexicalComposerContext();
  return (
    <Button
      className="wpifycf-field-richtext__button"
      icon={separatorIcon}
      label={__('Horizontal rule', 'wpify-custom-fields')}
      disabled={disabled}
      onClick={() => editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined)}
    />
  );
}
