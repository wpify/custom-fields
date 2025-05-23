import { useCallback } from 'react';
import clsx from 'clsx';
import { addFilter } from '@wordpress/hooks';
import { checkValidityStringType } from '@/helpers/validators';

export function Month ({
  id,
  htmlId,
  onChange,
  value = '',
  attributes = {},
  min,
  max,
  disabled = false,
  className,
}) {
  const handleChange = useCallback(event => onChange(event.target.value), [onChange]);

  return (
    <input
      type="month"
      id={htmlId}
      onChange={handleChange}
      value={value}
      className={clsx('wpifycf-field-month', `wpifycf-field-month--${id}`, attributes.class, className)}
      min={min}
      max={max}
      disabled={disabled}
      {...attributes}
    />
  );
}

Month.checkValidity = checkValidityStringType;

export default Month;
