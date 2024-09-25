import { useCallback } from 'react';
import clsx from 'clsx';
import { addFilter } from '@wordpress/hooks';
import { checkValidityNumberType } from '@/helpers/validators';

export function Number ({
  id,
  htmlId,
  onChange,
  value,
  min,
  max,
  step,
  attributes = {},
  className,
}) {
  const handleChange = useCallback(function (event) {
    if (typeof onChange === 'function') {
      onChange(parseFloat(event.target.value));
    }
  }, [onChange]);

  return (
    <input
      type="number"
      id={htmlId}
      onChange={handleChange}
      value={value}
      min={min}
      max={max}
      step={step}
      className={clsx('wpifycf-field-number', `wpifycf-field-number--${id}`, attributes.class, className)}
      {...attributes}
    />
  );
}

Number.checkValidity = checkValidityNumberType;

addFilter('wpifycf_field_number', 'wpify_custom_fields', () => Number);
