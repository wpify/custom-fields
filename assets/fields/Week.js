import { useCallback } from 'react';
import clsx from 'clsx';
import { addFilter } from '@wordpress/hooks';

export function Week ({
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
      type="week"
      id={htmlId}
      onChange={handleChange}
      value={value}
      className={clsx('wpifycf-field-week', `wpifycf-field-week--${id}`, attributes.class)}
      {...attributes}
    />
  );
}

addFilter('wpifycf_field_week', 'wpify_custom_fields', () => Week);
