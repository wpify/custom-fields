import { Select as SelectControl } from '@/components/Select.js';
import { useOptions, useOtherFieldValues, useSelectedOptionLabels } from '@/helpers/hooks';
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
  cache_options: cacheOptions = true,
  fieldPath,
}) {
  const [search, setSearch] = useState('');
  const { getValue } = useOtherFieldValues(fieldPath);

  const processedAsyncParams = useMemo(() => interpolateFieldValues(asyncParams, getValue), [asyncParams, getValue]);

  const { data: fetchedOptions, isFetching } = useOptions({
    optionsKey,
    enabled: !!optionsKey,
    initialData: options,
    search,
    sendValue: !cacheOptions,
    value,
    ...processedAsyncParams,
  });

  const { labels, mergeBrowse } = useSelectedOptionLabels({
    optionsKey,
    values: value,
    asyncParams: processedAsyncParams,
    sendValue: !cacheOptions,
  });

  useEffect(() => { mergeBrowse(fetchedOptions); }, [fetchedOptions, mergeBrowse]);

  const realOptions = useMemo(
    () => (optionsKey ? fetchedOptions : options).map(option => ({ ...option, label: stripHtml(option.label) })),
    [fetchedOptions, options]
  );

  const valueOption = useMemo(() => {
    if (value === '' || value === null || value === undefined) return null;
    const found = Array.isArray(realOptions) ? realOptions.find(o => String(o.value) === String(value)) : null;
    if (found) return { ...found, label: stripHtml(found.label) };
    // Off-slice selected value: fall back to the label store.
    return { value, label: stripHtml(labels[String(value)] || String(value)) };
  }, [realOptions, value, labels]);

  useEffect(() => { setTitle && setTitle(stripHtml(valueOption?.label || '')); }, [valueOption, setTitle]);

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
