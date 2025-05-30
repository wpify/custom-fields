import React, { useEffect } from 'react';
import clsx from 'clsx';
import { addFilter } from '@wordpress/hooks';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { checkValidityStringType } from '@/helpers/validators';

export function Tel ({
  id,
  htmlId,
  onChange,
  value = '',
  defaultValue = '',
  attributes = {},
  default_country: defaultCountry = 'US',
  className,
  disabled = false,
}) {
  useEffect(() => {
    if (typeof value !== 'string') {
      onChange('');
    }
  }, [value, onChange]);

  return (
    <PhoneInput
      international
      defaultCountry={defaultCountry}
      value={value}
      id={htmlId}
      onChange={onChange}
      disabled={disabled}
      className={clsx(
        'wpifycf-field-tel',
        `wpifycf-field-tel--${id}`,
        attributes.class,
        className,
      )}
      {...attributes}
    />
  );
}

Tel.checkValidity = checkValidityStringType;

export default Tel;
