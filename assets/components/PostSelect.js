import { useState, useMemo, useCallback, useEffect } from 'react';
import { useDebounce } from '@uidotdev/usehooks';
import { usePosts } from '@/helpers/hooks';
import Select from 'react-select';

export function PostSelect ({
  postType,
  onChange,
  onSelect,
  value,
  exclude,
  include,
  disabled,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sentSelected, setSentSelected] = useState(undefined);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { data: options = [], isLoading } = usePosts({
    postType, s: debouncedSearchTerm,
    ensure: [value],
    select: values => values.map(value => ({ ...value, label: value.title, value: value.id })),
    exclude,
    include,
  });

  const selectedOption = useMemo(
    () => value && options.find((option) => String(option.value) === String(value)),
    [options, value],
  );

  useEffect(() => {
    if (sentSelected !== selectedOption) {
      setSentSelected(selectedOption);
      typeof onSelect === 'function' && onSelect(selectedOption);
    }
  }, [sentSelected, selectedOption, onSelect]);

  const handleChange = useCallback(option => {
    if (typeof option !== 'undefined') {
      typeof onChange === 'function' && onChange(option?.value);
      typeof onSelect === 'function' && onSelect(option);
      setSentSelected(option);
    }
  }, [onChange, onSelect]);

  return (
    <Select
      unstyled
      isLoading={isLoading}
      isClearable
      options={options}
      value={selectedOption}
      onInputChange={setSearchTerm}
      filterOption={Boolean}
      className="wpifycf-select"
      classNamePrefix="wpifycf-select"
      onChange={handleChange}
      menuPortalTarget={document.body}
      isDisabled={disabled}
    />
  );
}
