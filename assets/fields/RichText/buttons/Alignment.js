import clsx from 'clsx';
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { alignLeft, alignCenter, alignRight, alignJustify } from '@wordpress/icons';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { FORMAT_ELEMENT_COMMAND } from 'lexical';

const MAP = {
  left:    { icon: alignLeft,    label: __('Align left', 'wpify-custom-fields') },
  center:  { icon: alignCenter,  label: __('Align center', 'wpify-custom-fields') },
  right:   { icon: alignRight,   label: __('Align right', 'wpify-custom-fields') },
  justify: { icon: alignJustify, label: __('Justify', 'wpify-custom-fields') },
};

export function AlignButton({ direction, active, disabled }) {
  const [editor] = useLexicalComposerContext();
  const spec = MAP[direction];
  if (!spec) return null;
  return (
    <Button
      className={clsx('wpifycf-field-richtext__button', active && 'wpifycf-field-richtext__button--active')}
      icon={spec.icon}
      label={spec.label}
      disabled={disabled}
      onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, direction)}
    />
  );
}
