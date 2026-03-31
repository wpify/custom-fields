import { useCallback, useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import { Field } from '@/components/Field';
import { checkValidityGroupType } from '@/helpers/validators';
import { flattenWrapperItems, stripHtml } from '@/helpers/functions';

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
  const flatItems = useMemo(() => flattenWrapperItems(items), [items]);

  const [titles, setTitles] = useState({});

  const handleSetTitle = useCallback(id => title => {
    const stripped = stripHtml(title);
    setTitles(prev => {
      if (prev[id] === stripped) return prev;
      return { ...prev, [id]: stripped };
    });
  }, []);

  const currentTitle = useMemo(() => {
    for (const item of flatItems) {
      const title = titles[item.id];
      if (title) return String(title);
      const v = value?.[item.id];
      if (v != null && v !== '' && (typeof v === 'string' || typeof v === 'number')) {
        return String(v);
      }
    }
    return '';
  }, [titles, flatItems, value]);

  useEffect(() => {
    if (typeof setTitle === 'function') {
      setTitle(currentTitle);
    }
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
          parentValue={value}
          parentOnChange={onChange}
          htmlId={`${htmlId}.${field.id}`}
          validity={fieldValidity[field.id]}
          fieldPath={`${fieldPath}.${field.id}`}
          setTitle={handleSetTitle(field.id)}
          setTitleFactory={handleSetTitle}
        />
      ))}
    </div>
  );
}

Group.descriptionPosition = 'before';
Group.checkValidity = checkValidityGroupType;

export { Group };

export default Group;
