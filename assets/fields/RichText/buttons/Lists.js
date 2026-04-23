import clsx from 'clsx';
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { formatListBullets, formatListNumbered } from '@wordpress/icons';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
} from '@lexical/list';

export function ListButton({ kind, active, disabled }) {
  const [editor] = useLexicalComposerContext();
  const isUl = kind === 'ul';
  const onClick = () => {
    if (active) {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(
        isUl ? INSERT_UNORDERED_LIST_COMMAND : INSERT_ORDERED_LIST_COMMAND,
        undefined,
      );
    }
  };
  return (
    <Button
      className={clsx('wpifycf-field-richtext__button', active && 'wpifycf-field-richtext__button--active')}
      icon={isUl ? formatListBullets : formatListNumbered}
      label={isUl ? __('Bullet list', 'wpify-custom-fields') : __('Numbered list', 'wpify-custom-fields')}
      disabled={disabled}
      onClick={onClick}
    />
  );
}
