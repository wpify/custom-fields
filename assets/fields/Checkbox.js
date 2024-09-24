import { useCallback } from 'react';
import clsx from 'clsx';
import { addFilter } from '@wordpress/hooks';

function Checkbox ({
  id,
  htmlId,
  onChange,
  value,
  attributes = {},
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
      className={clsx('wpifycf-field-checkbox', `wpifycf-field-checkbox--${id}`, attributes.class)}
      checked={value}
      {...attributes}
    />
  );
}

addFilter('wpifycf_field_checkbox', 'wpify_custom_fields', () => Checkbox);
