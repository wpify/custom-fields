import { useCallback } from 'react';

export function Number ({
  name,
  htmlId,
  onChange,
  value,
  attributes,
}) {
  const handleChange = useCallback(function (event) {
    if (typeof onChange === 'function') {
      onChange(parseFloat(event.target.value));
    }
  }, [onChange]);

  return (
    <input
      type="number"
      name={name}
      id={htmlId}
      onChange={handleChange}
      value={value}
      className="wpifycf-field-number"
      {...attributes}
    />
  );
}
