import { useCallback, useMemo } from 'react';
import clsx from 'clsx';
import { checkValidityStringType } from '@/helpers/validators';
import { useFieldTitle } from '@/helpers/hooks';
import { stripHtml } from '@/helpers/functions';

export function Radio ({
  id,
  htmlId,
  onChange,
  value = '',
  options = [],
  attributes = {},
  className,
  disabled = false,
  setTitle,
}) {
  const selectedLabel = useMemo(() => {
    const option = options.find(o => (o.value || o) === value);
    return option ? stripHtml(option.label || option) : '';
  }, [options, value]);
  useFieldTitle(setTitle, selectedLabel);
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
