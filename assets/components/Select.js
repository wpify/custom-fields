import ReactSelect from 'react-select';
import { useCallback } from 'react';
import clsx from 'clsx';

export function Select ({ value, onChange, options, filterOption, onInputChange, className, disabled, ...rest }) {
  const handleChange = useCallback(option => onChange(option?.value), [onChange]);

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
      {...rest}
    />
  );
}
