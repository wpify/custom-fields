import { addFilter } from '@wordpress/hooks';
import { ToggleControl } from '@wordpress/components';
import { checkValidityBooleanType } from '@/helpers/validators';
import clsx from 'clsx';
import { stripHtml } from '@/helpers/functions'
import { useEffect } from 'react';

function Toggle ({
  id,
  htmlId,
  value = null,
  title,
  disabled = false,
  onChange,
  className,
  setTitle,
}) {
  useEffect(() => {
    if (value) {
      setTitle(stripHtml(title));
    } else {
      setTitle('');
    }
  }, [setTitle, value]);

  return (
    <ToggleControl
      id={htmlId}
      label={<span dangerouslySetInnerHTML={{ __html: title }}/>}
      checked={value}
      onChange={onChange}
      disabled={disabled}
      className={clsx('wpifycf-field-toggle', `wpifycf-field-toggle--${id}`, className)}
      __nextHasNoMarginBottom
    />
  );
}

Toggle.checkValidity = checkValidityBooleanType;

export default Toggle;
