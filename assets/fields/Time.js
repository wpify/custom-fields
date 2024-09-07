import { useCallback } from 'react';

export function Time ({
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
      type="time"
      name={name}
      id={htmlId}
      onChange={handleChange}
      value={value}
      className="wpifycf-field-time"
      {...attributes}
    />
  );
}
