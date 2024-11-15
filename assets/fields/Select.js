import { addFilter } from '@wordpress/hooks';
import { Select as SelectControl } from '@/components/Select.js';
import { useOptions } from '@/helpers/hooks';
import { useMemo, useState } from 'react';
import { checkValidityStringType } from '@/helpers/validators';
import clsx from 'clsx';
import { Mapycz } from '@/fields/Mapycz'
import { stripHtml } from '@/helpers/functions'

export function Select ({
  id,
  value = '',
  onChange,
  options = [],
  options_key: optionsKey,
  className,
  disabled = false,
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
    <SelectControl
      id={id}
      value={Array.isArray(realOptions) && realOptions.find(option => String(option.value) === String(value))}
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

Select.Title = ({ field, value }) => {
  return stripHtml(field.options.find(option => String(option.value) === String(value))?.label);
};

addFilter('wpifycf_field_select', 'wpify_custom_fields', () => Select);
