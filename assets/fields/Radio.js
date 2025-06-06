import { useCallback } from 'react';
import clsx from 'clsx';
import { checkValidityStringType } from '@/helpers/validators';

export function Radio ({
  id,
  htmlId,
  onChange,
  value = '',
  options = [],
  attributes = {},
  className,
  disabled = false,
}) {
  const handleChange = useCallback(event => onChange(event.target.value), [onChange]);

  return (
    <div className={clsx('wpifycf-field-radio', `wpifycf-field-radio--${id}`, attributes.class, className)}>
      {options.map((option, index) => {
        const optionValue = option.value || option;
        const optionLabel = option.label || option;
        const isChecked = value === optionValue;
        const optionId = `${htmlId}-${index}`;

        return (
          <label key={optionId} htmlFor={optionId} className="wpifycf-field-radio__label">
            <input
              type="radio"
              id={optionId}
              onChange={handleChange}
              value={optionValue}
              checked={isChecked}
              disabled={disabled}
              {...attributes}
            />
            {optionLabel}
          </label>
        );
      })}
    </div>
  );
}

Radio.checkValidity = checkValidityStringType;

export default Radio;
