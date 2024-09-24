import { useCallback } from 'react';
import clsx from 'clsx';
import { addFilter } from '@wordpress/hooks';

function Color ({
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
      type="color"
      id={htmlId}
      onChange={handleChange}
      value={value}
      className={clsx('wpifycf-field-color', `wpifycf-field-color--${id}`, attributes.class)}
      {...attributes}
    />
  );
}

addFilter('wpifycf_field_color', 'wpify_custom_fields', () => Color);
