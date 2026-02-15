import { useCallback } from 'react';
import clsx from 'clsx';
import { addFilter } from '@wordpress/hooks';
import { checkValidityDateTimeType } from '@/helpers/validators';
import { useFieldTitle } from '@/helpers/hooks';

export function Date ({
  id,
  htmlId,
  onChange,
  value,
  attributes = {},
  min,
  max,
  disabled = false,
  className,
  setTitle,
}) {
  useFieldTitle(setTitle, value);
  const handleChange = useCallback(event => onChange(event.target.value), [onChange]);

  return (
    <input
      type="date"
      id={htmlId}
      onChange={handleChange}
      value={value}
      className={clsx('wpifycf-field-date', `wpifycf-field-date--${id}`, attributes.class, className)}
      min={min}
      max={max}
      disabled={disabled}
      {...attributes}
    />
  );
}

Date.checkValidity = checkValidityDateTimeType;

export default Date;
