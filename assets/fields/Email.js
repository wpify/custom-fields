import { useCallback } from 'react';
import clsx from 'clsx';
import { addFilter } from '@wordpress/hooks';
import { checkValidityEmailType } from '@/helpers/validators';

export function Email ({
  id,
  htmlId,
  onChange,
  value = '',
  attributes = {},
  disabled = false,
  className,
}) {
  const handleChange = useCallback(function (event) {
    if (typeof onChange === 'function') {
      onChange(event.target.value);
    }
  }, [onChange]);

  return (
    <input
      type="email"
      id={htmlId}
      onChange={handleChange}
      value={value}
      className={clsx('wpifycf-field-email', `wpifycf-field-email--${id}`, attributes.class, className)}
      disabled={disabled}
      {...attributes}
    />
  );
}

Email.checkValidity = checkValidityEmailType;

export default Email;
