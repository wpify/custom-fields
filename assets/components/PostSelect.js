import { useState, useMemo, useCallback } from 'react';
import { useDebounce } from '@uidotdev/usehooks';
import { usePosts } from '@/helpers/hooks';
import Select from 'react-select';

const PostSelect = ({ name, postType, onChange, value }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const { data: options = [], isLoading } = usePosts({ postType, s: debouncedSearchTerm, ensure: [value] });

  const selectedOption = useMemo(
    () => value && options.find((option) => option.value === value),
    [options, value],
  );

  const handleChange = useCallback((option) => {
    onChange(option?.value);
  }, [onChange]);

  return (
    <Select
      name={name}
      isLoading={isLoading}
      isClearable
      options={options}
      value={selectedOption}
      onInputChange={setSearchTerm}
      className="wpifycf-select"
      classNamePrefix="wpifycf-select"
      onChange={handleChange}
    />
  );
};

export default PostSelect;
