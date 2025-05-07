import { useCallback } from 'react';
import clsx from 'clsx';
import { addFilter } from '@wordpress/hooks';
import { checkValidityStringType } from '@/helpers/validators';

function Color ({
  id,
  htmlId,
  onChange,
  value = '',
  attributes = {},
  disabled = false,
  className,
}) {
  const handleChange = useCallback(event => onChange(event.target.value), [onChange]);

  return (
    <input
      type="color"
      id={htmlId}
      onChange={handleChange}
      value={value}
      className={clsx('wpifycf-field-color', `wpifycf-field-color--${id}`, attributes.class, className)}
      disabled={disabled}
      {...attributes}
    />
  );
}

Color.checkValidity = checkValidityStringType;

export default Color;
