import { useCallback, useEffect, useState } from 'react';
import { Field } from '@/components/Field';

function Group ({
  id,
  htmlId,
  name,
  value,
  onChange,
  items,
}) {
  const [fields, setFields] = useState(items);

  useEffect(function () {
    const nextValue = { ...value };
    const nextItems = items.map(function (item) {
      return {
        ...item,
        htmlId: id + '.' + item.id,
        value: nextValue[item.id] ?? '',
      };
    });

    setFields(nextItems);
  }, [items, value]);

  const handleChange = useCallback(function (id) {
    return function (fieldValue) {
      const nextValue = { ...value };
      nextValue[id] = fieldValue;
      onChange(nextValue);
    };
  }, [value, onChange]);

  return (
    <span className="wpifycf-group-field">
      {name && (
        <input type="hidden" id={htmlId} name={name} value={JSON.stringify(value)} />
      )}
      {fields.map((field, index) => (
        <Field
          key={field.id}
          {...field}
          onChange={handleChange(field.id)}
          htmlId={`${htmlId}.${field.id}`}
        />
      ))}
    </span>
  );
}

Group.descriptionPosition = 'before';

export { Group };
