import { useCallback } from 'react';

export function MultiCheckbox ({
  name,
  htmlId,
  onChange,
  value = {},
  options,
  attributes,
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
            className="wpifycf-field-multi-checkbox__checkbox"
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
