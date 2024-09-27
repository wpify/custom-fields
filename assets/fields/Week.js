import { useCallback } from 'react';
import clsx from 'clsx';
import { addFilter } from '@wordpress/hooks';
import { checkValidityStringType } from '@/helpers/validators';

export function Week ({
  id,
  htmlId,
  onChange,
  value,
  min,
  max,
  attributes = {},
  className,
}) {
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
      {...attributes}
    />
  );
}

Week.checkValidity = checkValidityStringType;

addFilter('wpifycf_field_week', 'wpify_custom_fields', () => Week);
