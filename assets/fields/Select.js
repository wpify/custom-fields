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
  async_params: asyncParams = {},
}) {
  const [search, setSearch] = useState('');

  const { data: fetchedOptions, isFetching } = useOptions({
    optionsKey,
    enabled: !!optionsKey,
    initialData: options,
    search,
    value,
    ...asyncParams,
  });

  const realOptions = useMemo(
    () => (optionsKey ? fetchedOptions : options).map(option => ({ ...option, label: stripHtml(option.label) })),
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

  console.log(isFetching);

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
      isFetching={isFetching}
    />
  );
}

Select.checkValidity = checkValidityStringType;

export default Select;
