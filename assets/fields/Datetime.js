import { useCallback } from 'react';
import clsx from 'clsx';
import { addFilter } from '@wordpress/hooks';
import { checkValidityDateTimeType } from '@/helpers/validators';
import { useFieldTitle } from '@/helpers/hooks';

export function Datetime ({
  id,
  htmlId,
  onChange,
  value = '',
  min,
  max,
  attributes = {},
  disabled = false,
  className,
  setTitle,
}) {
  useFieldTitle(setTitle, value);
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
      disabled={disabled}
      {...attributes}
    />
  );
}

Datetime.checkValidity = checkValidityDateTimeType;

export default Datetime;
