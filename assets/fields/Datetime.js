import { useCallback } from 'react';
import clsx from 'clsx';
import { addFilter } from '@wordpress/hooks';

export function Datetime ({
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
      type="date"
      id={htmlId}
      onChange={handleChange}
      value={value}
      className={clsx('wpifycf-field-datetime', `wpifycf-field-datetime--${id}`, attributes.class)}
      {...attributes}
    />
  );
}

addFilter('wpifycf_field_datetime', 'wpify_custom_fields', () => Datetime);
