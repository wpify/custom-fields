import { useCallback } from 'react';
import clsx from 'clsx';
import { addFilter } from '@wordpress/hooks';
import { checkValidityDateTimeType } from '@/helpers/validators';

export function Datetime ({
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
      type="datetime-local"
      id={htmlId}
      onChange={handleChange}
      value={value}
      min={min}
      max={max}
      className={clsx('wpifycf-field-datetime', `wpifycf-field-datetime--${id}`, attributes.class, className)}
      {...attributes}
    />
  );
}

Datetime.checkValidity = checkValidityDateTimeType;

addFilter('wpifycf_field_datetime', 'wpify_custom_fields', () => Datetime);
