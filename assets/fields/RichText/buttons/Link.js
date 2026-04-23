import clsx from 'clsx';
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { link as linkIcon } from '@wordpress/icons';

export function LinkButton({ active, disabled, onRequestOpen }) {
  return (
    <Button
      className={clsx('wpifycf-field-richtext__button', active && 'wpifycf-field-richtext__button--active')}
      icon={linkIcon}
      label={__('Insert/edit link', 'wpify-custom-fields')}
      disabled={disabled}
      onClick={() => onRequestOpen?.()}
    />
  );
}
