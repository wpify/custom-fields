import { useCallback } from 'react';
import clsx from 'clsx';
import { addFilter } from '@wordpress/hooks';
import { checkValidityNumberType } from '@/helpers/validators';

export function NumberInput ({
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
      disabled={disabled}
      {...attributes}
    />
  );
}

NumberInput.checkValidity = checkValidityNumberType;

export default NumberInput;
