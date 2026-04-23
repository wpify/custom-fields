import clsx from 'clsx';
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';

const PasteIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="currentColor" d="M19 2h-4.18A3 3 0 0 0 12 0a3 3 0 0 0-2.82 2H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Zm-7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2Zm7 18H5V4h2v2h10V4h2v16Z"/>
    <text x="7.5" y="17" fontSize="8" fontFamily="sans-serif" fontWeight="bold" fill="currentColor">T</text>
  </svg>
);

export function PasteAsTextButton({ armed, disabled, onToggle }) {
  return (
    <Button
      className={clsx('wpifycf-field-richtext__button', armed && 'wpifycf-field-richtext__button--armed')}
      label={__('Paste as plain text (one-shot)', 'wpify-custom-fields')}
      disabled={disabled}
      onClick={onToggle}
    >
      {PasteIcon}
    </Button>
  );
}
