import { useCallback } from 'react';
import clsx from 'clsx';
import { addFilter } from '@wordpress/hooks';
import { normalizeUrl } from '@/helpers/functions';
import { checkValidityStringType } from '@/helpers/validators';

export function Url ({
  id,
  htmlId,
  onChange,
  value = '',
  attributes = {},
  className,
  disabled = false,
}) {
  const handleChange = useCallback(event => onChange(event.target.value), [onChange]);

  const handleBlur = useCallback(event => {
    const normalizedUrl = normalizeUrl(event.target.value);

    if (value !== normalizedUrl) {
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
      className={clsx('wpifycf-field-url', `wpifycf-field-url--${id}`, attributes.class, className)}
      disabled={disabled}
      {...attributes}
    />
  );
}

Url.checkValidity = checkValidityStringType;

addFilter('wpifycf_field_url', 'wpify_custom_fields', () => Url);
