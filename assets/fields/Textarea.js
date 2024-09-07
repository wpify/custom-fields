import { useCallback } from 'react';

export function Textarea ({
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
    <textarea
      name={name}
      id={htmlId}
      onChange={handleChange}
      value={value}
      className="wpifycf-field-textarea"
      {...attributes}
    />
  );
}
