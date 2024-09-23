import React, { useState, useCallback } from 'react';
import clsx from 'clsx';
import { addFilter } from '@wordpress/hooks';
import PhoneInput from 'react-phone-number-input';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import 'react-phone-number-input/style.css';

export function Tel({
  id,
  name,
  htmlId,
  onChange,
  value,
  attributes = {},
  defaultCountry = 'US',
}) {
  const [phoneValue, setPhoneValue] = useState(value || '');

  const handleChange = useCallback(
    (value) => {
      setPhoneValue(value);
      if (typeof onChange === 'function') {
        let normalizedValue = '';
        if (value) {
          const phoneNumber = parsePhoneNumberFromString(value);
          if (phoneNumber && phoneNumber.isValid()) {
            normalizedValue = phoneNumber.number; // E.164 format
          }
        }
        onChange(normalizedValue);
      }
    },
    [onChange]
  );

  return (
    <PhoneInput
      international
      defaultCountry={defaultCountry}
      value={phoneValue}
      name={name}
      id={htmlId}
      onChange={handleChange}
      className={clsx(
        'wpifycf-field-tel',
        `wpifycf-field-tel--${id}`,
        attributes.class
      )}
      {...attributes}
    />
  );
}

addFilter('wpifycf_field_tel', 'wpify_custom_fields', () => Tel);
