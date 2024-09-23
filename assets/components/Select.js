import ReactSelect from 'react-select';
import { useCallback } from 'react';

export function Select ({ value, onChange, options, filterOption, onInputChange, ...rest }) {
  const handleChange = useCallback(option => {
    onChange(option?.value);
  }, [onChange]);

  return (
    <ReactSelect
      value={value}
      onChange={handleChange}
      options={options}
      isClearable
      className="wpifycf-select"
      classNamePrefix="wpifycf-select"
      filterOption={filterOption}
      onInputChange={onInputChange}
      {...rest}
    />
  );
}
