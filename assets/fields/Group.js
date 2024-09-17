import { useCallback, useEffect, useState } from 'react';
import { Field } from '@/components/Field';
import clsx from 'clsx';
import { addFilter } from '@wordpress/hooks';

function Group ({
  id,
  htmlId,
  name,
  value,
  onChange,
  items,
  attributes = {},
}) {
  const [fields, setFields] = useState(items);

  useEffect(function () {
    const nextItems = items.map(item => ({
      ...item,
      htmlId: id + '.' + item.id,
    }));

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
    <span
      className={clsx('wpifycf-field-group', `wpifycf-field-group--${id}`, attributes.class)}
    >
      {name && (
        <input type="hidden" id={htmlId} name={name} value={JSON.stringify(value)} />
      )}
      {fields.map(field => (
        <Field
          key={field.id}
          {...field}
          value={value[field.id] ?? ''}
          onChange={handleChange(field.id)}
          htmlId={`${htmlId}.${field.id}`}
        />
      ))}
    </span>
  );
}

Group.descriptionPosition = 'before';

export { Group };

addFilter('wpifycf_field_group', 'wpify_custom_fields', () => Group);
