import { useCallback } from 'react';

export function Checkbox ({
  name,
  htmlId,
  onChange,
  value,
  attributes,
}) {
  const handleChange = useCallback(function (event) {
    if (typeof onChange === 'function') {
      onChange(event.target.checked);
    }
  }, [onChange]);

  return (
    <input
      type="checkbox"
      name={name}
      id={htmlId}
      onChange={handleChange}
      className="wpifycf-field-checkbox"
      checked={value}
      {...attributes}
    />
  );
}
