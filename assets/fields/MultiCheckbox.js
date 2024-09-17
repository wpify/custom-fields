import { useCallback } from 'react';
import clsx from 'clsx';
import { addFilter } from '@wordpress/hooks';

function MultiCheckbox ({
  id,
  name,
  htmlId,
  onChange,
  value = {},
  options,
  attributes = {},
}) {
  const handleChange = useCallback(optionValue => event => {
    const nextValue = { ...value };
    nextValue[optionValue] = event.target.checked;
    onChange(nextValue);
  }, [onChange, value]);
  return (
    <span className="wpifycf-field-multi-checkbox">
      {options.map((option, index) => (
        <span className={`wpifycf-field-multi-checkbox__item wpifycf-field-multi-checkbox__item--${option.value}`}>
          <input
            type="checkbox"
            name={`${name}[${option.value}]`}
            id={`${htmlId}-${option.value}`}
            onChange={handleChange(option.value)}
            checked={value[option.value]}
            className={clsx('wpifycf-field-multi-checkbox', `wpifycf-field-multi-checkbox--${id}`, `wpifycf-field-multi-checkbox--${option.value}`, attributes.class)}
            {...attributes}
          />
          <label
            className="wpifycf-field-multi-checkbox__label"
            htmlFor={`${htmlId}-${option.value}`}
          >
            {option.label}
          </label>
        </span>
      ))}
    </span>
  );
}

addFilter('wpifycf_field_multi_checkbox', 'wpify_custom_fields', () => MultiCheckbox);
