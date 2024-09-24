import { useCallback, useEffect, useState } from 'react';
import clsx from 'clsx';
import { addFilter, applyFilters } from '@wordpress/hooks';
import { Field } from '@/components/Field';
import { Text } from '@/fields/Text';

function Group ({
  id,
  htmlId,
  value,
  onChange,
  items,
  attributes = {},
}) {
  const [fields, setFields] = useState(items);

  useEffect(function () {
    const nextItems = items.map(item => ({
      ...item,
      htmlId: htmlId + '.' + item.id,
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
      {fields.map(field => (
        <Field
          key={field.id}
          {...field}
          value={value[field.id] || ''}
          onChange={handleChange(field.id)}
          htmlId={`${htmlId}.${field.id}`}
        />
      ))}
    </span>
  );
}

Group.descriptionPosition = 'before';

Group.Title = ({ field, value, index }) => {
  for (const item of field.items) {
    const FieldComponent = applyFilters('wpifycf_field_' + item.type, Text);

    if (!value[item.id]) {
      continue;
    }

    if (typeof FieldComponent.Title === 'function') {
      return <FieldComponent.Title value={value[item.id]} />;
    }

    if (typeof value[item.id] === 'string') {
      return value[item.id];
    }
  }

  if (typeof index === 'number') {
    return `#${index + 1}`;
  }

  return null;
};

export { Group };

addFilter('wpifycf_field_group', 'wpify_custom_fields', () => Group);
