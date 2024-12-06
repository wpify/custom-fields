import { useCallback, useEffect, useState } from 'react';
import clsx from 'clsx';
import { addFilter } from '@wordpress/hooks';
import { Field } from '@/components/Field';
import { checkValidityGroupType } from '@/helpers/validators';
import { stripHtml } from '@/helpers/functions';

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
  setTitle,
}) {
  const fieldValidity = validity?.reduce((acc, item) => typeof item === 'object' ? { ...acc, ...item } : acc, {});

  const [titles, setTitles] = useState(() => {
    const nextItems = {};
    for (const item of items) {
      if (value[item.id] !== 'undefined' && (typeof value[item.id] === 'string' || typeof value[item.id] === 'number') && Boolean(value[item.id])) {
        nextItems[item.id] = String(value[item.id]);
      }
    }
    return nextItems;
  });

  const [currentTitle, setCurrentTitle] = useState(() => {
    for (const item of items) {
      if (typeof titles[item.id] !== 'undefined' && Boolean(titles[item.id])) {
        return String(titles[item.id]);
      }
    }
    return '';
  });

  const handleSetTitle = useCallback(id => title => {
    if (titles[id] !== title) {
      const nextTitles = { ...titles, [id]: stripHtml(title) };
      let nextCurrentTitle = '';
      for (const item of items) {
        if (typeof nextTitles[item.id] !== 'undefined' && Boolean(nextTitles[item.id])) {
          nextCurrentTitle = String(nextTitles[item.id]);
          break;
        } else if (value[item.id] !== 'undefined' && (typeof value[item.id] === 'string' || typeof value[item.id] === 'number') && Boolean(value[item.id])) {
          nextCurrentTitle = String(value[item.id]);
          break;
        }
      }
      setTitles(nextTitles);
      if (nextCurrentTitle !== currentTitle) {
        setCurrentTitle(nextCurrentTitle);
      }
    }
  }, [setTitles, currentTitle, titles, items, value]);

  useEffect(() => {
    setTitle(currentTitle);
  }, [currentTitle, setTitle]);

  const handleChange = useCallback(
    id => fieldValue => onChange({ ...value, [id]: fieldValue }),
    [value, onChange]
  );

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
          setTitle={handleSetTitle(field.id)}
        />
      ))}
    </div>
  );
}

Group.descriptionPosition = 'before';
Group.checkValidity = checkValidityGroupType;

export { Group };

addFilter('wpifycf_field_group', 'wpify_custom_fields', () => Group);
