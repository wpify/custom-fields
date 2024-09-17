import { useCallback } from 'react';
import clsx from 'clsx';
import { addFilter } from '@wordpress/hooks';

export function Tel ({
  id,
  name,
  htmlId,
  onChange,
  value,
  attributes = {},
}) {
  const handleChange = useCallback(function (event) {
    if (typeof onChange === 'function') {
      onChange(parseFloat(event.target.value));
    }
  }, [onChange]);

  return (
    <input
      type="tel"
      name={name}
      id={htmlId}
      onChange={handleChange}
      value={value}
      className={clsx('wpifycf-field-tel', `wpifycf-field-tel--${id}`, attributes.class)}
      {...attributes}
    />
  );
}

addFilter('wpifycf_field_tel', 'wpify_custom_fields', () => Tel);
