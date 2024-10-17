import { useCallback } from 'react';
import clsx from 'clsx';
import { addFilter } from '@wordpress/hooks';
import { checkValidityStringType } from '@/helpers/validators';

export function Time ({
  id,
  htmlId,
  onChange,
  value = '',
  min,
  max,
  attributes = {},
  className,
}) {
  const handleChange = useCallback(event => onChange(event.target.value), [onChange]);

  return (
    <input
      type="time"
      id={htmlId}
      onChange={handleChange}
      value={value}
      min={min}
      max={max}
      className={clsx('wpifycf-field-time', `wpifycf-field-time--${id}`, attributes.class, className)}
      {...attributes}
    />
  );
}

Time.checkValidity = checkValidityStringType;

addFilter('wpifycf_field_time', 'wpify_custom_fields', () => Time);
