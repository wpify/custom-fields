import { useCallback } from 'react';
import { addFilter } from '@wordpress/hooks';
import { ToggleControl } from '@wordpress/components';
import { checkValidityMultiBooleanType } from '@/helpers/validators';
import clsx from 'clsx';

function MultiToggle ({
  id,
  htmlId,
  onChange,
  value = {},
  options,
  className,
}) {
  const handleChange = useCallback(optionValue => checked => onChange({ ...value, [optionValue]: checked }), [onChange, value]);

  return (
    <div className={clsx('wpifycf-field-multi-toggle', `wpifycf-field-multi-toggle--${id}`, className)}>
      {options.map(option => (
        <div className={`wpifycf-field-multi-toggle__item wpifycf-field-multi-checkbox__item--${option.value}`} key={option.value}>
          <ToggleControl
            id={`${htmlId}-${option.value}`}
            onChange={handleChange(option.value)}
            checked={value[option.value]}
            label={option.label}
          />
        </div>
      ))}
    </div>
  );
}

MultiToggle.checkValidity = checkValidityMultiBooleanType;

addFilter('wpifycf_field_multi_toggle', 'wpify_custom_fields', () => MultiToggle);
