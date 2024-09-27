import ReactSelect from 'react-select';
import { useCallback } from 'react';
import clsx from 'clsx';

export function Select ({ value, onChange, options, filterOption, onInputChange, className, ...rest }) {
  const handleChange = useCallback(option => onChange(option?.value), [onChange]);

  return (
    <ReactSelect
      value={value}
      onChange={handleChange}
      options={options}
      isClearable
      className={clsx('wpifycf-select', className)}
      classNamePrefix="wpifycf-select"
      filterOption={filterOption}
      onInputChange={onInputChange}
      {...rest}
    />
  );
}
