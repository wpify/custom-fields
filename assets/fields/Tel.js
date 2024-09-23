import React from 'react';
import clsx from 'clsx';
import { addFilter } from '@wordpress/hooks';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

export function Tel ({
  id,
  name,
  htmlId,
  onChange,
  value,
  attributes = {},
  defaultCountry = 'US',
}) {
  return (
    <>
      {name && (
        <input type="hidden" name={name} value={value} />
      )}
      <PhoneInput
        international
        defaultCountry={defaultCountry}
        value={value}
        id={htmlId}
        onChange={onChange}
        className={clsx(
          'wpifycf-field-tel',
          `wpifycf-field-tel--${id}`,
          attributes.class,
        )}
        {...attributes}
      />
    </>
  );
}

addFilter('wpifycf_field_tel', 'wpify_custom_fields', () => Tel);
