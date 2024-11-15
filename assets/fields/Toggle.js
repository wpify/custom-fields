import { addFilter } from '@wordpress/hooks';
import { ToggleControl } from '@wordpress/components';
import { checkValidityBooleanType } from '@/helpers/validators';
import clsx from 'clsx';
import { stripHtml } from '@/helpers/functions'

function Toggle ({
  id,
  htmlId,
  value = false,
  title,
  disabled = false,
  onChange,
  className,
}) {
  return (
    <ToggleControl
      id={htmlId}
      label={<span dangerouslySetInnerHTML={{ __html: title }}/>}
      checked={value}
      onChange={onChange}
      disabled={disabled}
      className={clsx('wpifycf-field-toggle', `wpifycf-field-toggle--${id}`, className)}
    />
  );
}

Toggle.checkValidity = checkValidityBooleanType;

Toggle.Title = ({ field, value }) => {
  return stripHtml(field.label);
};

addFilter('wpifycf_field_toggle', 'wpify_custom_fields', () => Toggle);
