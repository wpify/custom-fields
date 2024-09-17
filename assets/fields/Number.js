import { useCallback } from 'react';
import clsx from 'clsx';
import { addFilter } from '@wordpress/hooks';

export function Number ({
  id,
  name,
  htmlId,
  onChange,
  value,
  min,
  max,
  step,
  attributes = {},
}) {
  const handleChange = useCallback(function (event) {
    if (typeof onChange === 'function') {
      onChange(parseFloat(event.target.value));
    }
  }, [onChange]);

  return (
    <input
      type="number"
      name={name}
      id={htmlId}
      onChange={handleChange}
      value={value}
      min={min}
      max={max}
      step={step}
      className={clsx('wpifycf-field-number', `wpifycf-field-number--${id}`, attributes.class)}
      {...attributes}
    />
  );
}

addFilter('wpifycf_field_number', 'wpify_custom_fields', () => Number);
