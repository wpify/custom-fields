import { useCallback } from 'react';
import clsx from 'clsx';
import { addFilter } from '@wordpress/hooks';

function Hidden ({
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
      type="hidden"
      name={name}
      id={htmlId}
      onChange={handleChange}
      value={value}
      className={clsx('wpifycf-field-hidden', `wpifycf-field-hidden--${id}`, attributes.class)}
      {...attributes}
    />
  );
}

addFilter('wpifycf_field_hidden', 'wpify_custom_fields', () => Hidden);
