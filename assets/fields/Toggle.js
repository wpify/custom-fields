import { addFilter } from '@wordpress/hooks';
import { ToggleControl } from '@wordpress/components';
import { checkValidityBooleanType } from '@/helpers/validators';
import clsx from 'clsx';

function Toggle ({
  id,
  htmlId,
  value = false,
  item_label,
  onChange,
  className,
}) {
  return (
    <ToggleControl
      id={htmlId}
      label={item_label}
      checked={value}
      onChange={onChange}
      className={clsx('wpifycf-field-toggle', `wpifycf-field-toggle--${id}`, className)}
    />
  );
}

Toggle.checkValidity = checkValidityBooleanType;

addFilter('wpifycf_field_toggle', 'wpify_custom_fields', () => Toggle);
