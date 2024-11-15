import { useCallback } from 'react';
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
}) {
  const handleChange = useCallback(event => onChange(event.target.checked), [onChange]);

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

Checkbox.Title = ({ field, value }) => {
  return stripHtml(field.label);
};

addFilter('wpifycf_field_checkbox', 'wpify_custom_fields', () => Checkbox);
