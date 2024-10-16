import { useCallback } from 'react';
import { addFilter } from '@wordpress/hooks';
import { checkValidityMultiBooleanType } from '@/helpers/validators';
import clsx from 'clsx';

function MultiCheckbox ({
  id,
  htmlId,
  onChange,
  value = {},
  options,
  attributes = {},
  className,
}) {
  const handleChange = useCallback(optionValue => event => {
    const nextValue = { ...value };
    nextValue[optionValue] = event.target.checked;
    onChange(nextValue);
  }, [onChange, value]);

  return (
    <div className={clsx('wpifycf-field-multi-checkbox', `wpifycf-field-multi-checkbox--${id}`, className)}>
      {options.map(option => (
        <div className={`wpifycf-field-multi-checkbox__item wpifycf-field-multi-checkbox__item--${option.value}`} key={option.value}>
          <input
            type="checkbox"
            id={`${htmlId}-${option.value}`}
            onChange={handleChange(option.value)}
            checked={value[option.value] || false}
            {...attributes}
          />
          <label
            className="wpifycf-field-multi-checkbox__label"
            htmlFor={`${htmlId}-${option.value}`}
          >
            {option.label}
          </label>
        </div>
      ))}
    </div>
  );
}

MultiCheckbox.checkValidity = checkValidityMultiBooleanType;

addFilter('wpifycf_field_multi_checkbox', 'wpify_custom_fields', () => MultiCheckbox);
