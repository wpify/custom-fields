import { useCallback } from 'react';
import clsx from 'clsx';
import { addFilter } from '@wordpress/hooks';
import { normalizeUrl } from '@/helpers/functions';

export function Url ({
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

  const handleBlur = useCallback(function (event) {
    const normalizedUrl = normalizeUrl(event.target.value);

    if (value !== normalizedUrl && typeof onChange === 'function') {
      onChange(normalizedUrl);
    }
  }, [onChange, value]);

  return (
    <input
      type="url"
      id={htmlId}
      onChange={handleChange}
      onBlur={handleBlur}
      value={value}
      className={clsx('wpifycf-field-url', `wpifycf-field-url--${id}`, attributes.class)}
      {...attributes}
    />
  );
}

addFilter('wpifycf_field_url', 'wpify_custom_fields', () => Url);
