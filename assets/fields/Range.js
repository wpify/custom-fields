import { useCallback } from 'react';
import clsx from 'clsx';
import { addFilter } from '@wordpress/hooks';
import { checkValidityNumberType } from '@/helpers/validators';

export function Range ({
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
  const handleChange = useCallback(event => onChange(event.target.value), [onChange]);

  const isValid = !isNaN(parseFloat(value));

  return (
    <span className={clsx('wpifycf-field-range', `wpifycf-field-range--${id}`, attributes.class, className)}>
      {min && <span className="wpifycf-field-range__minmax">{min}</span>}
      <input
        type="range"
        id={htmlId}
        onChange={handleChange}
        value={value}
        min={min}
        max={max}
        step={step}
        {...attributes}
      />
      {max && <span className="wpifycf-field-range__minmax">{max}</span>}
      {isValid && <span className="wpifycf-field-range__value">{value}</span>}
    </span>
  );
}

Range.checkValidity = checkValidityNumberType;

addFilter('wpifycf_field_range', 'wpify_custom_fields', () => Range);
