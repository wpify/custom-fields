import { addFilter } from '@wordpress/hooks';
import { Select as SelectControl } from '@/components/Select.js';
import { useMulti, useOptions } from '@/helpers/hooks';
import { useCallback, useMemo, useState } from 'react';
import { IconButton } from '@/components/IconButton';
import { checkValidityMultiStringType } from '@/helpers/validators';
import clsx from 'clsx';

export function MultiSelect ({
  id,
  value = [],
  onChange,
  options = [],
  options_key: optionsKey,
  className,
}) {
  const [search, setSearch] = useState('');

  const { data: fetchedOptions } = useOptions({
    optionsKey,
    enabled: !!optionsKey,
    initialData: options,
    search,
  });

  const realOptions = useMemo(
    () => optionsKey ? fetchedOptions : options,
    [fetchedOptions, options]
  );

  const availableOptions = useMemo(
    () => realOptions.filter(option => !value?.includes(option.value)),
    [realOptions, value],
  );

  const usedOptions = useMemo(
    () => value.map(value => realOptions.find(option => String(option.value) === String(value)) || { value, label: value }),
    [realOptions, value],
  );

  const {
    containerRef,
    remove
  } = useMulti({
    value,
    onChange,
  });

  const handleChange = useCallback(newValue => onChange([newValue, ...value]), [onChange, value]);

  return (
    <span className={clsx('wpifycf-field-multi-select', `wpifycf-field-multi-select--${id}`, className)}>
      {usedOptions.length > 0 && (
        <span className="wpifycf-field-multi-select__options" ref={containerRef}>
          {usedOptions.map((option, index) => (
            <span className="wpifycf-field-multi-select__option" key={option.value}>
              <span>{option.label}</span>
              <IconButton icon="trash" onClick={remove(index)} />
            </span>
          ))}
        </span>
      )}
      {availableOptions.length > 0 && (
        <SelectControl
          id={id}
          value={null}
          onChange={handleChange}
          options={availableOptions}
          filterOption={optionsKey ? Boolean : undefined}
          onInputChange={setSearch}
        />
      )}
    </span>
  );
}

MultiSelect.checkValidity = checkValidityMultiStringType;

addFilter('wpifycf_field_multi_select', 'wpify_custom_fields', () => MultiSelect);
