import { useCallback } from 'react';
import clsx from 'clsx';
import { addFilter } from '@wordpress/hooks';

export function Url ({
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
      type="url"
      name={name}
      id={htmlId}
      onChange={handleChange}
      value={value}
      className={clsx('wpifycf-field-url', `wpifycf-field-url--${id}`, attributes.class)}
      {...attributes}
    />
  );
}

addFilter('wpifycf_field_url', 'wpify_custom_fields', () => Url);
