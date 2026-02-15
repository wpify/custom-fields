import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { Field } from '@/components/Field';
import { AppContext } from '@/components/AppContext';

const noop = () => null;

function useContainerWidth (ref) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        setWidth(entry.contentBoxSize?.[0]?.inlineSize ?? entry.contentRect.width);
      }
    });

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [ref]);

  return width;
}

function Columns ({
  id,
  htmlId,
  items = [],
  columns = 2,
  gap,
  classname,
  attributes = {},
  disabled = false,
  fieldPath,
  parentValue,
  parentOnChange,
  setTitleFactory,
  validity = [],
}) {
  const containerRef = useRef(null);
  const containerWidth = useContainerWidth(containerRef);
  const { values, updateValue } = useContext(AppContext);
  const isInsideGroup = typeof parentOnChange === 'function';

  // Strip columns' own segment from fieldPath so children get paths relative to the parent.
  const parentFieldPath = fieldPath ? fieldPath.split('.').slice(0, -1).join('.') : '';

  const fieldValidity = validity?.reduce((acc, item) => typeof item === 'object' ? { ...acc, ...item } : acc, {});

  const handleChange = useCallback(
    id => fieldValue => parentOnChange && parentOnChange({ ...parentValue, [id]: fieldValue }),
    [parentValue, parentOnChange]
  );

  const effectiveColumns = containerWidth > 0
    ? Math.max(1, Math.min(columns, Math.floor(containerWidth / 300)))
    : columns;

  const isCollapsed = effectiveColumns < columns;

  const style = {
    '--wpifycf-columns': effectiveColumns,
    ...(gap ? { '--wpifycf-columns-gap': gap } : {}),
  };

  return (
    <div
      ref={containerRef}
      className={clsx('wpifycf-field-columns', classname)}
      style={style}
      {...attributes}
    >
      {items.map(field => {
        const childFieldPath = parentFieldPath
          ? `${parentFieldPath}.${field.id}`
          : field.id;

        const itemStyle = {};

        if (!isCollapsed) {
          const col = field.column ? Math.min(field.column, effectiveColumns) : null;
          const span = field.column_span ? Math.min(field.column_span, col ? effectiveColumns - col + 1 : effectiveColumns) : null;

          if (col && span) {
            itemStyle.gridColumn = `${col} / span ${span}`;
          } else if (col) {
            itemStyle.gridColumn = col;
          } else if (span) {
            itemStyle.gridColumn = `span ${span}`;
          }
        }

        if (isInsideGroup) {
          return (
            <div key={field.id} className="wpifycf-field-columns__item" style={itemStyle}>
              <Field
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
            </div>
          );
        }

        return (
          <div key={field.id} className="wpifycf-field-columns__item" style={itemStyle}>
            <Field
              disabled={disabled}
              {...field}
              name={field.name || field.id}
              value={values[field.id]}
              onChange={updateValue(field.id)}
              htmlId={field.id.replace(/[\[\]]+/g, '_')}
              fieldPath={field.id}
              setTitle={noop}
            />
          </div>
        );
      })}
    </div>
  );
}

Columns.renderOptions = {
  noLabel: true,
  noFieldWrapper: true,
  noControlWrapper: true,
};

export default Columns;
