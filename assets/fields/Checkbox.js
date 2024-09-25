import { useCallback } from 'react';
import clsx from 'clsx';
import { addFilter } from '@wordpress/hooks';
import { checkValidityBooleanType } from '@/helpers/validators';

function Checkbox ({
  id,
  htmlId,
  onChange,
  value,
  attributes = {},
  className,
}) {
  const handleChange = useCallback(function (event) {
    if (typeof onChange === 'function') {
      onChange(event.target.checked);
    }
  }, [onChange]);

  return (
    <input
      type="checkbox"
      id={htmlId}
      onChange={handleChange}
      className={clsx('wpifycf-field-checkbox', `wpifycf-field-checkbox--${id}`, attributes.class, className)}
      checked={value}
      {...attributes}
    />
  );
}

Checkbox.checkValidity = checkValidityBooleanType;

addFilter('wpifycf_field_checkbox', 'wpify_custom_fields', () => Checkbox);
