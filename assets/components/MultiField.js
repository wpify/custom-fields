import { useCallback } from 'react';

export function MultiField ({ component: Component, name, value = [], onChange, default: defaultValue, ...props }) {
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

  const moveUp = useCallback(function (index) {
    return function () {
      if (index > 0) {
        const nextValues = [...value];
        const temp = nextValues[index];
        nextValues[index] = nextValues[index - 1];
        nextValues[index - 1] = temp;
        onChange(nextValues);
      }
    };
  }, [value, onChange]);

  const moveDown = useCallback(function (index) {
    return function () {
      if (index < value.length - 1) {
        const nextValues = [...value];
        const temp = nextValues[index];
        nextValues[index] = nextValues[index + 1];
        nextValues[index + 1] = temp;
        onChange(nextValues);
      }
    };
  }, [value, onChange]);

  const handleChange = useCallback(function (index) {
    return function (fieldValue) {
      const nextValues = [...value];
      nextValues[index] = fieldValue;
      onChange(nextValues);
    };
  }, [value, onChange]);

  return (
    <fieldset className={'wpifycf-multi-field wpifycf-multi-field--' + props.type}>
      {name && (
        <input type="hidden" name={name} value={JSON.stringify(value)} />
      )}
      {Array.isArray(value) && value.map((value, index) => (
        <div className="wpifycf-multi-field-item">
          <div className="wpifycf-multi-field-item-field">
            <Component
              key={index}
              value={value}
              default={defaultValue}
              onChange={handleChange(index)}
              {...props}
              htmlId={props.id + '.' + index}
            />
          </div>
          <div className="wpifycf-multi-field-item-actions">
            <button type="button" onClick={remove(index)}>➖</button>
            <button type="button" onClick={moveUp(index)}>⬆</button>
            <button type="button" onClick={moveDown(index)}>⬇</button>
          </div>
        </div>
      ))}
      <div className="wpifycf-multi-field-item-buttons-after">
        <button type="button" onClick={add}>➕</button>
      </div>
    </fieldset>
  );
}
