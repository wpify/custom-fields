import { useCallback } from 'react';
import clsx from 'clsx';
import { addFilter } from '@wordpress/hooks';
import { checkValidityStringType } from '@/helpers/validators';

export function Text ({
  id,
  htmlId,
  onChange,
  value = '',
  attributes = {},
  className,
  disabled = false,
}) {
  const handleChange = useCallback(event => onChange(event.target.value), [onChange]);

  return (
    <input
      type="text"
      id={htmlId}
      onChange={handleChange}
      value={value}
      className={clsx('wpifycf-field-text', `wpifycf-field-text--${id}`, attributes.class, className)}
      disabled={disabled}
      {...attributes}
    />
  );
}

Text.checkValidity = checkValidityStringType;

addFilter('wpifycf_field_text', 'wpify_custom_fields', () => Text);
