import ReactSelect from 'react-select';
import { useCallback } from 'react';
import clsx from 'clsx';
import { __ } from '@wordpress/i18n';

export function Select ({ value, onChange, options, filterOption, onInputChange, className, disabled, isFetching, ...rest }) {
  const handleChange = useCallback(option => onChange(option?.value), [onChange]);
  const placeholder = isFetching
    ? __('Loading options...', 'wpify-custom-fields')
    : __('Select an option', 'wpify-custom-fields');

  return (
    <ReactSelect
      unstyled
      value={value}
      onChange={handleChange}
      options={options}
      isClearable
      className={clsx('wpifycf-select', className)}
      classNamePrefix="wpifycf-select"
      filterOption={filterOption}
      onInputChange={onInputChange}
      menuPortalTarget={document.body}
      isDisabled={disabled}
      placeholder={placeholder}
      {...rest}
    />
  );
}
