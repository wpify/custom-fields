import clsx from 'clsx';
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { code as codeIcon, edit as editIcon } from '@wordpress/icons';
import { VIEW_CODE } from '../config';

export function ViewToggleButton({ view, disabled, onToggle }) {
  const inCode = view === VIEW_CODE;
  return (
    <Button
      className={clsx('wpifycf-field-richtext__button', inCode && 'wpifycf-field-richtext__button--active')}
      icon={inCode ? editIcon : codeIcon}
      label={inCode ? __('Switch to visual', 'wpify-custom-fields') : __('Switch to code', 'wpify-custom-fields')}
      disabled={disabled}
      onClick={onToggle}
    />
  );
}
