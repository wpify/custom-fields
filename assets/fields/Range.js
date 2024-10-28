import { useCallback } from 'react';
import clsx from 'clsx';
import { addFilter } from '@wordpress/hooks';
import { checkValidityNumberType } from '@/helpers/validators';

export function Range ({
  id,
  htmlId,
  onChange,
  value = '',
  min,
  max,
  step,
  attributes = {},
  className,
  disabled = false,
}) {
  const handleChange = useCallback(event => onChange(Number(event.target.value)), [onChange]);
  const isValid = !isNaN(parseFloat(value));

  return (
    <div className={clsx('wpifycf-field-range', `wpifycf-field-range--${id}`, attributes.class, className)}>
      {min && <div className="wpifycf-field-range__minmax">{min}</div>}
      <input
        type="range"
        id={htmlId}
        onChange={handleChange}
        value={value}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        {...attributes}
      />
      {max && <div className="wpifycf-field-range__minmax">{max}</div>}
      {isValid && <div className="wpifycf-field-range__value">{value}</div>}
    </div>
  );
}

Range.checkValidity = checkValidityNumberType;

addFilter('wpifycf_field_range', 'wpify_custom_fields', () => Range);
