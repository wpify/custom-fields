import { useCallback } from 'react';
import clsx from 'clsx';
import { addFilter } from '@wordpress/hooks';

export function Time ({
  id,
  name,
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
      type="time"
      name={name}
      id={htmlId}
      onChange={handleChange}
      value={value}
      className={clsx('wpifycf-field-time', `wpifycf-field-time--${id}`, attributes.class)}
      {...attributes}
    />
  );
}

addFilter('wpifycf_field_time', 'wpify_custom_fields', () => Time);
