import { useCallback } from 'react';
import clsx from 'clsx';
import { addFilter } from '@wordpress/hooks';
import { checkValidityStringType } from '@/helpers/validators';
import { useFieldTitle } from '@/helpers/hooks';

export function Textarea ({
  id,
  htmlId,
  onChange,
  value = '',
  attributes = {},
  className,
  disabled = false,
  counter = false,
  setTitle,
}) {
  useFieldTitle(setTitle, value ? String(value).substring(0, 50) : '');
  const handleChange = useCallback(event => onChange(event.target.value), [onChange]);

  return (
    <>
      <textarea
        id={htmlId}
        onChange={handleChange}
        value={value}
        className={clsx('wpifycf-field-textarea', `wpifycf-field-textarea--${id}`, attributes.class, className)}
        disabled={disabled}
        {...attributes}
      />
      {counter && (
        <span className="wpifycf-field-textarea__counter">{String(value).length}</span>
      )}
    </>
  );
}

Textarea.checkValidity = checkValidityStringType;

export default Textarea;
