import { useCallback } from 'react';
import clsx from 'clsx';
import { addFilter } from '@wordpress/hooks';

export function Hidden ({
  id,
  htmlId,
  onChange,
  value = '',
  attributes = {},
  className
}) {
  const handleChange = useCallback(event => onChange(event.target.value), [onChange]);

  return (
    <input
      type="hidden"
      id={htmlId}
      onChange={handleChange}
      value={value}
      className={clsx('wpifycf-field-hidden', `wpifycf-field-hidden--${id}`, attributes.class, className)}
      {...attributes}
    />
  );
}

addFilter('wpifycf_field_hidden', 'wpify_custom_fields', () => Hidden);
