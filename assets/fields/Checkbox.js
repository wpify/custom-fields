import { useCallback, useEffect } from 'react';
import clsx from 'clsx';
import { addFilter } from '@wordpress/hooks';
import { checkValidityBooleanType } from '@/helpers/validators';
import { stripHtml } from '@/helpers/functions'

function Checkbox ({
  id,
  htmlId,
  onChange,
  value = false,
  attributes = {},
  className,
  title,
  disabled = false,
  setTitle,
}) {
  useEffect(() => {
    if (typeof setTitle === 'function') {
      setTitle(value ? stripHtml(title) : '');
    }
  }, [setTitle, value, title]);

  const handleChange = useCallback(event => {
    onChange(event.target.checked);
  }, [onChange]);

  return (
    <label>
      <input
        type="checkbox"
        id={htmlId}
        onChange={handleChange}
        className={clsx('wpifycf-field-checkbox', `wpifycf-field-checkbox--${id}`, attributes.class, className)}
        checked={value}
        disabled={disabled}
        {...attributes}
      />
      <span dangerouslySetInnerHTML={{ __html: title }} />
    </label>
  );
}

Checkbox.checkValidity = checkValidityBooleanType;

export default Checkbox;
