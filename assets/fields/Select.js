import { addFilter } from '@wordpress/hooks';
import { Select as SelectControl } from '@/components/Select.js';
import { useOptions } from '@/helpers/hooks';
import { useEffect, useMemo, useState } from 'react';
import { checkValidityStringType } from '@/helpers/validators';
import clsx from 'clsx';
import { stripHtml } from '@/helpers/functions'

export function Select ({
  id,
  value = '',
  onChange,
  options = [],
  options_key: optionsKey,
  className,
  disabled = false,
  setTitle,
}) {
  const [search, setSearch] = useState('');

  console.log(id, options);

  const { data: fetchedOptions } = useOptions({
    optionsKey,
    enabled: !!optionsKey,
    initialData: options,
    search,
    value,
  });

  console.log(id, fetchedOptions);

  const realOptions = useMemo(
    () => optionsKey ? fetchedOptions : options,
    [fetchedOptions, options]
  );

  const valueOption = useMemo(() => {
    if (Array.isArray(realOptions)) {
      return realOptions.find(option => String(option.value) === String(value));
    }
    return null;
  }, [realOptions, value]);

  useEffect(() => {
    setTitle && setTitle(stripHtml(valueOption?.label || ''));
  }, [valueOption, setTitle]);

  console.log(setTitle)

  return (
    <SelectControl
      id={id}
      value={valueOption}
      onChange={onChange}
      options={realOptions}
      filterOption={optionsKey ? Boolean : undefined}
      onInputChange={setSearch}
      className={clsx('wpifycf-field-select', `wpifycf-field-select--${id}`, className)}
      disabled={disabled}
    />
  );
}

Select.checkValidity = checkValidityStringType;

addFilter('wpifycf_field_select', 'wpify_custom_fields', () => Select);
