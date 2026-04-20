import { useCallback } from 'react';
import clsx from 'clsx';
import { checkValidityStringType } from '@/helpers/validators';
import { useFieldTitle } from '@/helpers/hooks';
import { IconButton } from '@/components/IconButton';

function Color ({
  id,
  htmlId,
  onChange,
  value = '',
  attributes = {},
  disabled = false,
  required = false,
  className,
  setTitle,
}) {
  useFieldTitle(setTitle, value);
  const handleChange = useCallback(event => onChange(event.target.value), [onChange]);
  const handleClear = useCallback(() => onChange(''), [onChange]);
  const isEmpty = !value;
  const showClear = !required && !disabled && !isEmpty;

  return (
    <span
      className={clsx(
        'wpifycf-field-color-wrapper',
        { 'wpifycf-field-color-wrapper--empty': isEmpty },
      )}
    >
      <input
        type="color"
        id={htmlId}
        onChange={handleChange}
        value={value || '#000000'}
        className={clsx('wpifycf-field-color', `wpifycf-field-color--${id}`, attributes.class, className)}
        disabled={disabled}
        {...attributes}
      />
      {showClear && (
        <IconButton
          icon="trash"
          onClick={handleClear}
          className="wpifycf-field-color__clear"
          style="light"
        />
      )}
    </span>
  );
}

Color.checkValidity = checkValidityStringType;

export default Color;
