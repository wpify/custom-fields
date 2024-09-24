import { addFilter } from '@wordpress/hooks';
import { Select as SelectControl } from '@/components/Select.js';
import { useOptions } from '@/helpers/hooks';
import { useMemo, useState } from 'react';

export function Select ({
  id,
  name,
  value,
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
    value,
  });

  const realOptions = useMemo(
    () => optionsKey ? fetchedOptions : options,
    [fetchedOptions, options]
  );

  return (
    <>
      {name && (
        <input type="hidden" name={name} value={value} />
      )}
      <SelectControl
        id={id}
        value={Array.isArray(realOptions) && realOptions.find(option => String(option.value) === String(value))}
        onChange={onChange}
        options={realOptions}
        filterOption={optionsKey ? Boolean : undefined}
        onInputChange={setSearch}
      />
    </>
  );
}

addFilter('wpifycf_field_select', 'wpify_custom_fields', () => Select);
