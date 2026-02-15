import { useCallback } from 'react';
import clsx from 'clsx';
import { addFilter } from '@wordpress/hooks';
import { checkValidityStringType } from '@/helpers/validators';
import { useFieldTitle } from '@/helpers/hooks';

export function Week ({
  id,
  htmlId,
  onChange,
  value = '',
  min,
  max,
  attributes = {},
  className,
  disabled = false,
  setTitle,
}) {
  useFieldTitle(setTitle, value);
  const handleChange = useCallback(event => onChange(event.target.value), [onChange]);

  return (
    <input
      type="week"
      id={htmlId}
      onChange={handleChange}
      value={value}
      min={min}
      max={max}
      className={clsx('wpifycf-field-week', `wpifycf-field-week--${id}`, attributes.class, className)}
      disabled={disabled}
      {...attributes}
    />
  );
}

Week.checkValidity = checkValidityStringType;

export default Week;
