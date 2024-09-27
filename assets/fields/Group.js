import { useCallback } from 'react';
import clsx from 'clsx';
import { addFilter, applyFilters } from '@wordpress/hooks';
import { Field } from '@/components/Field';
import { Text } from '@/fields/Text';
import { checkValidityGroupType } from '@/helpers/validators';

function Group ({
  id,
  htmlId,
  value = {},
  onChange,
  items,
  attributes = {},
  validity = [],
  className,
  fieldPath,
}) {
  const handleChange = useCallback(id => fieldValue => onChange({ ...value, [id]: fieldValue }), [value, onChange]);
  const fieldValidity = validity?.reduce((acc, item) => typeof item === 'object' ? { ...acc, ...item } : acc, {});

  return (
    <span
      className={clsx('wpifycf-field-group', `wpifycf-field-group--${id}`, attributes.class, className)}
    >
      {items.map(field => (
        <Field
          key={field.id}
          {...field}
          value={value[field.id] || ''}
          onChange={handleChange(field.id)}
          htmlId={`${htmlId}.${field.id}`}
          validity={fieldValidity[field.id]}
          fieldPath={`${fieldPath}.${field.id}`}
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

Group.checkValidity = checkValidityGroupType;

export { Group };

addFilter('wpifycf_field_group', 'wpify_custom_fields', () => Group);
