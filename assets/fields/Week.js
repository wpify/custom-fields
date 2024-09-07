import { useCallback } from 'react';

export function Week ({
  name,
  htmlId,
  onChange,
  value,
  attributes,
}) {
  const handleChange = useCallback(function (event) {
    if (typeof onChange === 'function') {
      onChange(event.target.value);
    }
  }, [onChange]);

  return (
    <input
      type="week"
      name={name}
      id={htmlId}
      onChange={handleChange}
      value={value}
      className="wpifycf-field-week"
      {...attributes}
    />
  );
}
