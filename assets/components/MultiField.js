import { useCallback, useRef, useState, useEffect } from 'react';
import { IconButton } from '@/components/IconButton';
import { useSortableList } from '@/helpers/hooks';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/Button';

export function MultiField ({
  component: Component,
  name,
  value = [],
  onChange,
  default: defaultValue,
  buttons = {},
  disabled_buttons = [],
  min,
  max,
  htmlId,
  ...props
}) {
  const containerRef = useRef(null);
  const [keyPrefix, setKeyPrefix] = useState(uuidv4());

  const add = useCallback(function () {
    onChange([...value, defaultValue]);
  }, [value, defaultValue, onChange]);

  const remove = useCallback(function (index) {
    return function () {
      const nextValues = [...value];
      nextValues.splice(index, 1);
      onChange(nextValues);
    };
  }, [value, onChange]);

  const handleChange = useCallback(function (index) {
    return function (fieldValue) {
      const nextValues = [...value];
      nextValues[index] = fieldValue;
      onChange(nextValues);
    };
  }, [value, onChange]);

  const handleSort = useCallback((nextValue) => {
    setKeyPrefix(uuidv4());
    onChange(nextValue);
  }, [onChange]);

  useSortableList({
    containerRef,
    items: value,
    setItems: handleSort,
    handle: '.wpifycf-sort',
  });

  useEffect(() => {
    if (min !== undefined && value.length < min) {
      onChange([...value, ...Array(min - value.length).fill(defaultValue)]);
    }

    if (max !== undefined && value.length > max) {
      onChange(value.slice(0, max));
    }
  }, [onChange, value, min, max, defaultValue]);

  const length = value.length;
  const canAdd = !disabled_buttons.includes('move') && (typeof max === 'undefined' || length < max);
  const canRemove = !disabled_buttons.includes('delete') && (typeof min === 'undefined' || length > min);
  const canMove = !disabled_buttons.includes('move') && length > 1;

  return (
    <span className={'wpifycf-multi-field wpifycf-multi-field--' + props.type}>
      {name && (
        <input type="hidden" name={name} value={JSON.stringify(value)} />
      )}
      <span className="wpifycf-multi-field-items" ref={containerRef}>
        {Array.isArray(value) && value.map((value, index) => (
          <span className="wpifycf-multi-field-item" key={keyPrefix + '.' + index}>
            {canMove && (
              <span className="wpifycf-multi-field-item__sort">
                <IconButton icon="move" className="wpifycf-sort" />
              </span>
            )}
            <span className="wpifycf-multi-field-item-field">
              <Component
                value={value}
                default={defaultValue}
                onChange={handleChange(index)}
                {...props}
                htmlId={htmlId + '.' + index}
              />
            </span>
            {canRemove && (
              <span className="wpifycf-multi-field-item-actions">
              {buttons.remove ? (
                <Button onClick={remove(index)}>
                  {buttons.remove}
                </Button>
              ) : (
                <IconButton icon="trash" onClick={remove(index)} />
              )}
            </span>
            )}
          </span>
        ))}
      </span>
      {canAdd && (
        <span className="wpifycf-multi-field-item-buttons-after">
        {buttons.add ? (
          <Button onClick={add}>
            {buttons.add}
          </Button>
        ) : (
          <IconButton icon="plus" onClick={add} />
        )}
      </span>
      )}
    </span>
  );
}
