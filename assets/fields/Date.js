import { useCallback } from 'react';

export function Date ({
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
      type="date"
      name={name}
      id={htmlId}
      onChange={handleChange}
      value={value}
      className="wpifycf-field-date"
      {...attributes}
    />
  );
}
