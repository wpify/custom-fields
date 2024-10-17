import { IconButton } from '@/components/IconButton';
import { useMulti } from '@/helpers/hooks';
import { Button } from '@/components/Button';
import clsx from 'clsx';
import { Field } from '@/components/Field';

export function MultiField ({
  type,
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
  fieldPath,
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

  const fieldsValidity = validity?.reduce((acc, item) => typeof item === 'object' ? { ...acc, ...item } : acc, {});

  return (
    <div className={clsx('wpifycf-multi-field', `wpifycf-multi-field--${type}`, className)}>
      {name && <input type="hidden" name={name} value={JSON.stringify(value)} />}
      <div className="wpifycf-multi-field-items" ref={containerRef}>
        {Array.isArray(value) && value.map((value, index) => (
          <div
            className={clsx('wpifycf-multi-field-item')}
            key={keyPrefix + '.' + index}
          >
            {canMove && (
              <div className="wpifycf-multi-field-item__sort">
                <IconButton icon="move" className="wpifycf-sort" />
              </div>
            )}
            <div className={'wpifycf-multi-field-item-field wpifycf-multi-field-item-field--' + type}>
              <Field
                {...props}
                type={type}
                value={value}
                default={defaultValue}
                onChange={handleChange(index)}
                htmlId={htmlId + '.' + index}
                validity={fieldsValidity[index]}
                renderOptions={{ noLabel: true, noWrapper: true }}
                fieldPath={`${fieldPath}[${index}]`}
              />
            </div>
            {canRemove && (
              <div className="wpifycf-multi-field-item-actions">
              {buttons.remove ? (
                <Button onClick={remove(index)}>
                  {buttons.remove}
                </Button>
              ) : (
                <IconButton icon="trash" onClick={remove(index)} />
              )}
            </div>
            )}
          </div>
        ))}
      </div>
      {canAdd && (
        <div className="wpifycf-multi-field-item-buttons-after">
          {buttons.add ? (
            <Button onClick={add}>
              {buttons.add}
            </Button>
          ) : (
            <IconButton icon="plus" onClick={add} size={24} />
          )}
        </div>
      )}
    </div>
  );
}
