import { useCallback } from 'react';
import clsx from 'clsx';
import { addFilter } from '@wordpress/hooks';
import { checkValidityStringType } from '@/helpers/validators';

function Password ({
  id,
  htmlId,
  onChange,
  value = '',
  attributes = {},
  className,
  disabled = false,
}) {
  const handleChange = useCallback(event => onChange(String(event.target.value)), [onChange]);

  return (
    <input
      type="password"
      id={htmlId}
      onChange={handleChange}
      value={value}
      className={clsx('wpifycf-field-password', `wpifycf-field-password--${id}`, attributes.class, className)}
      disabled={disabled}
      {...attributes}
    />
  );
}

Password.checkValidity = checkValidityStringType;

addFilter('wpifycf_field_password', 'wpify_custom_fields', () => Password);
