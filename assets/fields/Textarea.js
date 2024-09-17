import { useCallback } from 'react';
import clsx from 'clsx';
import { addFilter } from '@wordpress/hooks';

export function Textarea ({
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
    <textarea
      name={name}
      id={htmlId}
      onChange={handleChange}
      value={value}
      className={clsx('wpifycf-field-textarea', `wpifycf-field-textarea--${id}`, attributes.class)}
      {...attributes}
    />
  );
}

addFilter('wpifycf_field_textarea', 'wpify_custom_fields', () => Textarea);
