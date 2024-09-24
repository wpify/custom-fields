import { useCallback } from 'react';
import clsx from 'clsx';
import { addFilter } from '@wordpress/hooks';

export function Month ({
  id,
  htmlId,
  onChange,
  value,
  attributes = {},
}) {
  const handleChange = useCallback(function (event) {
    if (typeof onChange === 'function') {
      onChange(event.target.value);
    }
  }, [onChange]);

  return (
    <input
      type="month"
      id={htmlId}
      onChange={handleChange}
      value={value}
      className={clsx('wpifycf-field-month', `wpifycf-field-month--${id}`, attributes.class)}
      {...attributes}
    />
  );
}

addFilter('wpifycf_field_month', 'wpify_custom_fields', () => Month);
