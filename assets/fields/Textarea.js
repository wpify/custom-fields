import { useCallback } from 'react';
import clsx from 'clsx';
import { addFilter } from '@wordpress/hooks';
import { checkValidityStringType } from '@/helpers/validators';

export function Textarea ({
  id,
  htmlId,
  onChange,
  value = '',
  attributes = {},
  className,
  disabled = false,
}) {
  const handleChange = useCallback(event => onChange(event.target.value), [onChange]);

  return (
    <textarea
      id={htmlId}
      onChange={handleChange}
      value={value}
      className={clsx('wpifycf-field-textarea', `wpifycf-field-textarea--${id}`, attributes.class, className)}
      disabled={disabled}
      {...attributes}
    />
  );
}

Textarea.checkValidity = checkValidityStringType;

addFilter('wpifycf_field_textarea', 'wpify_custom_fields', () => Textarea);
