import { addFilter } from '@wordpress/hooks';
import { Select as SelectControl } from '@/components/Select.js';
import { useMulti, useOptions, useOtherFieldValues, useFieldTitle, useSelectedOptionLabels } from '@/helpers/hooks';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { IconButton } from '@/components/IconButton';
import { checkValidityMultiStringType } from '@/helpers/validators';
import clsx from 'clsx';
import { useDebounce } from '@uidotdev/usehooks';
import { stripHtml, interpolateFieldValues } from '@/helpers/functions';

export function MultiSelect ({
  id,
  value = [],
  onChange,
  options = [],
  options_key: optionsKey,
  className,
  disabled,
  async_params: asyncParams = {},
  cache_options: cacheOptions = true,
  fieldPath,
  setTitle,
}) {
  useEffect(() => {
    if (!Array.isArray(value)) {
      onChange([]);
    }
  }, [value, onChange]);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const { getValue } = useOtherFieldValues(fieldPath);

  const processedAsyncParams = useMemo(() => interpolateFieldValues(asyncParams, getValue), [asyncParams, getValue]);

  const { data, isSuccess, isFetching } = useOptions({
    optionsKey,
    enabled: !!optionsKey,
    initialData: options,
    search: debouncedSearch,
    sendValue: !cacheOptions,
    value,
    ...processedAsyncParams,
  });

  const { labels: allOptions, mergeBrowse } = useSelectedOptionLabels({
    optionsKey,
    values: value,
    asyncParams: processedAsyncParams,
    sendValue: !cacheOptions,
  });

  useEffect(() => { if (isSuccess) mergeBrowse(data); }, [data, isSuccess, mergeBrowse]);

  const realOptions = useMemo(
    () => (optionsKey
      ? (data.length > 0 ? data : [{ value: '', label: 'No options found' }])
      : options).map(option => ({ ...option, label: stripHtml(option.label) })),
    [data, options]
  );

  const availableOptions = useMemo(
    () => realOptions.filter(option => !value?.includes(option.value)),
    [realOptions, value],
  );

  const usedOptions = useMemo(
    () => {
      const options = Array.isArray(value)
        ? value
          .filter(Boolean)
          .map(
            value => realOptions.find(option => String(option.value) === String(value)
            ) || {
              value,
              label: stripHtml(value)
            })
        : [];
      return options.map(option => ({ ...option, label: stripHtml(option.label) }))
    },
    [realOptions, value],
  );

  const titleValue = useMemo(() => {
    if (!Array.isArray(value) || value.length === 0) return '';
    const labels = value.slice(0, 3).map(v => allOptions[v] || v).filter(Boolean);
    if (value.length > 3) return labels.join(', ') + ` (+${value.length - 3})`;
    return labels.join(', ');
  }, [value, allOptions]);
  useFieldTitle(setTitle, titleValue);

  const {
    containerRef,
    remove
  } = useMulti({
    value,
    onChange,
    disabled,
  });

  const handleChange = useCallback(newValue => onChange([newValue, ...value]), [onChange, value]);

  return (
    <div className={clsx('wpifycf-field-multi-select', `wpifycf-field-multi-select--${id}`, className)}>
      {usedOptions.length > 0 && (
        <div className="wpifycf-field-multi-select__options" ref={containerRef}>
          {usedOptions.map((option, index) => (
            <div className="wpifycf-field-multi-select__option" key={option.value}>
              <span>{allOptions[option.value] || option.value}</span>
              {!disabled && (
                <IconButton icon="trash" onClick={remove(index)}/>
              )}
            </div>
          ))}
        </div>
      )}
      <SelectControl
        id={id}
        value={null}
        onChange={handleChange}
        options={availableOptions}
        filterOption={optionsKey ? Boolean : undefined}
        onInputChange={setSearch}
        disabled={disabled}
        isFetching={isFetching}
      />
    </div>
  );
}

MultiSelect.checkValidity = checkValidityMultiStringType;

export default MultiSelect;
