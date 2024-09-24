import { useCallback } from 'react';
import { addFilter } from '@wordpress/hooks';
import { ToggleControl } from '@wordpress/components';

function MultiToggle ({
  id,
  name,
  htmlId,
  onChange,
  value = {},
  options,
}) {
  const handleChange = useCallback(optionValue => checked => {
    const nextValue = { ...value };
    nextValue[optionValue] = checked;
    onChange(nextValue);
  }, [onChange, value]);

  return (
    <span className="wpifycf-field-multi-toggle">
      {name && (
        <input
          type="hidden"
          name={name}
          value={JSON.stringify(value)}
        />
      )}
      {options.map((option, index) => (
        <span className={`wpifycf-field-multi-toggle__item wpifycf-field-multi-checkbox__item--${option.value}`} key={option.value}>
          <ToggleControl
            id={`${htmlId}-${option.value}`}
            onChange={handleChange(option.value)}
            checked={value[option.value]}
            label={option.label}
          />
        </span>
      ))}
    </span>
  );
}

addFilter('wpifycf_field_multi_toggle', 'wpify_custom_fields', () => MultiToggle);