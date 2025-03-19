import { addFilter } from '@wordpress/hooks';
import { Select as SelectControl } from '@/components/Select.js';
import { useMulti, useOptions } from '@/helpers/hooks';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { IconButton } from '@/components/IconButton';
import { checkValidityMultiStringType } from '@/helpers/validators';
import clsx from 'clsx';
import { useDebounce } from '@uidotdev/usehooks';

export function MultiSelect ({
  id,
  value = [],
  onChange,
  options = [],
  options_key: optionsKey,
  className,
  disabled,
  async_params: asyncParams = {},
}) {
  useEffect(() => {
    if (!Array.isArray(value)) {
      onChange([]);
    }
  }, [value, onChange]);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [allOptions, setAllOptions] = useState({});

  const { data, isSuccess } = useOptions({
    optionsKey,
    enabled: !!optionsKey,
    initialData: options,
    search: debouncedSearch,
    value,
    ...asyncParams,
  });

  useEffect(() => {
    if (isSuccess) {
      setAllOptions((allOptions) => ({
        ...allOptions,
        ...data.reduce((acc, option) => {
          acc[option.value] = option.label;
          return acc;
        }, {})
      }));
    }
  }, [data, isSuccess]);

  const realOptions = useMemo(
    () => optionsKey
      ? (data.length > 0 ? data : [{ value: '', label: 'No options found' }])
      : options,
    [data, options]
  );

  const availableOptions = useMemo(
    () => realOptions.filter(option => !value?.includes(option.value)),
    [realOptions, value],
  );

  const usedOptions = useMemo(
    () => Array.isArray(value)
      ? value.filter(Boolean).map(
        value => realOptions.find(option => String(option.value) === String(value)
        ) || {
          value,
          label: value
        })
      : [],
    [realOptions, value],
  );

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
      />
    </div>
  );
}

MultiSelect.checkValidity = checkValidityMultiStringType;

addFilter('wpifycf_field_multi_select', 'wpify_custom_fields', () => MultiSelect);
