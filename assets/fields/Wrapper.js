import { useCallback, useContext } from 'react';
import clsx from 'clsx';
import { Field } from '@/components/Field';
import { AppContext } from '@/components/AppContext';

const noop = () => null;

function Wrapper ({
  id,
  htmlId,
  items = [],
  tag: Tag = 'div',
  classname,
  attributes = {},
  disabled = false,
  fieldPath,
  parentValue,
  parentOnChange,
  setTitleFactory,
  validity = [],
}) {
  const { values, updateValue } = useContext(AppContext);
  const isInsideGroup = typeof parentOnChange === 'function';

  // Strip wrapper's own segment from fieldPath so children get paths relative to the parent.
  const parentFieldPath = fieldPath ? fieldPath.split('.').slice(0, -1).join('.') : '';

  const fieldValidity = validity?.reduce((acc, item) => typeof item === 'object' ? { ...acc, ...item } : acc, {});

  const handleChange = useCallback(
    id => fieldValue => parentOnChange && parentOnChange({ ...parentValue, [id]: fieldValue }),
    [parentValue, parentOnChange]
  );

  return (
    <Tag
      className={clsx('wpifycf-field-wrapper', classname)}
      {...attributes}
    >
      {items.map(field => {
        const childFieldPath = parentFieldPath
          ? `${parentFieldPath}.${field.id}`
          : field.id;

        if (isInsideGroup) {
          return (
            <Field
              key={field.id}
              disabled={disabled}
              {...field}
              value={parentValue[field.id] || ''}
              onChange={handleChange(field.id)}
              parentValue={parentValue}
              parentOnChange={parentOnChange}
              setTitle={setTitleFactory ? setTitleFactory(field.id) : noop}
              setTitleFactory={setTitleFactory}
              htmlId={`${htmlId}.${field.id}`}
              validity={fieldValidity[field.id]}
              fieldPath={childFieldPath}
            />
          );
        }

        return (
          <Field
            key={field.id}
            disabled={disabled}
            {...field}
            name={field.name || field.id}
            value={values[field.id]}
            onChange={updateValue(field.id)}
            htmlId={field.id.replace(/[\[\]]+/g, '_')}
            fieldPath={field.id}
            setTitle={noop}
          />
        );
      })}
    </Tag>
  );
}

Wrapper.renderOptions = {
  noLabel: true,
  noFieldWrapper: true,
  noControlWrapper: true,
};

export default Wrapper;
