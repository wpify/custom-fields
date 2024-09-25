import { IconButton } from '@/components/IconButton';
import { useMulti } from '@/helpers/hooks';
import { Button } from '@/components/Button';
import clsx from 'clsx';

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
  className,
  validity = [],
  ...props
}) {
  const {
    add,
    remove,
    handleChange,
    canAdd,
    canRemove,
    canMove,
    containerRef,
    keyPrefix,
  } = useMulti({
    value,
    onChange,
    min,
    max,
    defaultValue,
    disabled_buttons,
    dragHandle: '.wpifycf-multi-field-item__sort',
  });

  const fieldsValidity = validity?.reduce((acc, item) => {
    if (typeof item === 'object') {
      return { ...acc, ...item };
    }

    return acc;
  }, {});

  return (
    <span className={clsx('wpifycf-multi-field', `wpifycf-multi-field--${props.type}`, className)}>
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
                validity={fieldsValidity[index]}
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
            <IconButton icon="plus" onClick={add} size={24} />
          )}
        </span>
      )}
    </span>
  );
}
