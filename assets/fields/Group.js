import { useCallback } from 'react';
import clsx from 'clsx';
import { addFilter, applyFilters } from '@wordpress/hooks';
import { Field } from '@/components/Field';
import { Text } from '@/fields/Text';
import { checkValidityGroupType } from '@/helpers/validators';
import { stripHtml } from '@/helpers/functions'

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
  disabled = false,
}) {
  const handleChange = useCallback(id => fieldValue => onChange({ ...value, [id]: fieldValue }), [value, onChange]);
  const fieldValidity = validity?.reduce((acc, item) => typeof item === 'object' ? { ...acc, ...item } : acc, {});

  return (
    <div
      className={clsx('wpifycf-field-group', `wpifycf-field-group--${id}`, attributes.class, className)}
    >
      {items.map(field => (
        <Field
          key={field.id}
          disabled={disabled}
          {...field}
          value={value[field.id] || ''}
          onChange={handleChange(field.id)}
          htmlId={`${htmlId}.${field.id}`}
          validity={fieldValidity[field.id]}
          fieldPath={`${fieldPath}.${field.id}`}
        />
      ))}
    </div>
  );
}

Group.descriptionPosition = 'before';

Group.Title = ({ field, value, index }) => {
  for (const item of field.items) {
    const FieldComponent = applyFilters('wpifycf_field_' + item.type, Text);

    if (!value[item.id]) {
      continue;
    }

    if (typeof FieldComponent.Title === 'function' && value[item.id]) {
      return <FieldComponent.Title value={value[item.id]} field={item} />;
    }

    if (typeof value[item.id] === 'string') {
      return stripHtml(value[item.id]);
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
