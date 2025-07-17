import { Select as SelectControl } from '@/components/Select.js';
import { useOptions, useOtherFieldValues } from '@/helpers/hooks';
import { useEffect, useMemo, useState } from 'react';
import { checkValidityStringType } from '@/helpers/validators';
import clsx from 'clsx';
import { stripHtml, interpolateFieldValues } from '@/helpers/functions'

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
  fieldPath,
}) {
  const [search, setSearch] = useState('');
  const { getValue } = useOtherFieldValues(fieldPath);

  // Interpolate field values into async parameters
  const processedAsyncParams = useMemo(() => {
    return interpolateFieldValues(asyncParams, getValue);
  }, [asyncParams, getValue]);

  const { data: fetchedOptions, isFetching } = useOptions({
    optionsKey,
    enabled: !!optionsKey,
    initialData: options,
    search,
    value,
    ...processedAsyncParams,
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
