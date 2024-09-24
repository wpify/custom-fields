import { addFilter } from '@wordpress/hooks';
import { Select as SelectControl } from '@/components/Select.js';
import { useMulti, useOptions } from '@/helpers/hooks';
import { useCallback, useMemo, useState } from 'react';
import { IconButton } from '@/components/IconButton';

export function MultiSelect ({
  id,
  name,
  value = [],
  onChange,
  options = [],
  options_key: optionsKey,
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
    () => value.map(value => realOptions.find(option => option.value === value)),
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
    <span className="wpifycf-field-multi-select">
      {name && (
        <input type="hidden" name={name} value={JSON.stringify(value)} />
      )}
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

addFilter('wpifycf_field_multi_select', 'wpify_custom_fields', () => MultiSelect);
