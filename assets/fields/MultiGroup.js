import { useMulti } from '@/helpers/hooks';
import clsx from 'clsx';
import { Button } from '@/components/Button';
import { __ } from '@wordpress/i18n';
import { IconButton } from '@/components/IconButton';
import { checkValidityMultiGroupType } from '@/helpers/validators';
import { Field } from '@/components/Field';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { flattenWrapperItems } from '@/helpers/functions';

function MultiGroup ({
  value = [],
  onChange,
  buttons = {},
  disabled_buttons = [],
  min,
  max,
  htmlId,
  className,
  validity = [],
  fieldPath,
  disabled = false,
  collapse = true,
  setTitle,
  ...props
}) {
  useEffect(() => {
    if (!Array.isArray(value)) {
      onChange([]);
    }
  }, [value, onChange]);

  const defaultValue = useMemo(() => {
    return flattenWrapperItems(props.items).reduce((acc, item) => {
      acc[item.id] = item.default;
      return acc;
    }, {});
  }, [props.items]);

  const [titles, setTitles] = useState(() => {
    if (!Array.isArray(value)) {
      return [];
    }
    return value.map(() => '');
  });

  const handleSetTitle = useCallback(index => title => {
    setTitles(prev => {
      if (prev[index] === title) return prev;
      const next = [...prev];
      next[index] = title;
      return next;
    });
  }, []);

  const handleMutate = useCallback(({ type, ...args }) => {
    setTitles(prev => {
      switch (type) {
        case 'sort':
          return args.indexMap.map(oldIdx => prev[oldIdx] || '');
        case 'remove': {
          const next = [...prev];
          next.splice(args.index, 1);
          return next;
        }
        case 'duplicate': {
          const next = [...prev];
          next.splice(args.index, 0, prev[args.index]);
          return next;
        }
        case 'add':
          return [...prev, ''];
        default:
          return prev;
      }
    });
  }, []);

  const {
    add,
    remove,
    duplicate,
    handleChange,
    canAdd,
    canRemove,
    canMove,
    canDuplicate,
    containerRef,
    keyPrefix,
    collapsed,
    toggleCollapsed,
  } = useMulti({
    value,
    onChange,
    min,
    max,
    defaultValue,
    disabled_buttons,
    disabled,
    collapse,
    dragHandle: '.wpifycf__move-handle',
    onMutate: handleMutate,
  });

  const fieldsValidity = validity?.reduce((acc, item) => typeof item === 'object' ? { ...acc, ...item } : acc, {});

  return (
    <div className={clsx('wpifycf-field-multi-group', `wpifycf-field-multi-group--${props.id}`, props.attributes?.class, className)}>
      <div className="wpifycf-field-multi-group__items" ref={containerRef}>
        {Array.isArray(value) && value.map((value, index) => (
          <div
            className={clsx(
              'wpifycf-field-multi-group__item',
              collapsed[index] && 'wpifycf-field-multi-group__item--collapsed',
              !collapse && 'wpifycf-field-multi-group__item--not-collapsible',
              fieldsValidity[index] && 'wpifycf-field-multi-group__item--invalid',
            )}
            key={keyPrefix + '.' + index}
          >
            <div className="wpifycf-field-multi-group__item-header wpifycf__move-handle">
              {canMove && (
                <div className="wpifycf-field-multi-group__sort" onClick={collapse ? toggleCollapsed(index) : undefined}>
                  <IconButton icon="move" className="wpifycf-sort" />
                </div>
              )}
              <div className="wpifycf-field-multi-group__title" onClick={collapse ? toggleCollapsed(index) : undefined}>
                {titles[index] || `#${index + 1}`}
              </div>
              <div className={clsx('wpifycf-field-multi-group__header-actions')}>
                {canDuplicate && (
                  <div className="wpifycf-field-multi-group__duplicate">
                    {buttons.duplicate ? (
                      <Button onClick={duplicate(index)}>
                        {buttons.duplicate}
                      </Button>
                    ) : (
                      <IconButton icon="duplicate" onClick={duplicate(index)} />
                    )}
                  </div>
                )}
                {canRemove && (
                  <div className="wpifycf-field-multi-group__remove">
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
            </div>
            <div className="wpifycf-field-multi-group__content">
              <Field
                {...props}
                disabled={disabled}
                value={value}
                default={defaultValue}
                onChange={handleChange(index)}
                type="group"
                htmlId={htmlId + '.' + index}
                validity={fieldsValidity[index]}
                fieldPath={`${fieldPath}[${index}]`}
                renderOptions={{ noLabel: true, noFieldWrapper: true, noControlWrapper: true }}
                setTitle={handleSetTitle(index)}
              />
            </div>
          </div>
        ))}
      </div>
      {canAdd && (
        <div className="wpifycf-field-multi-group__actions">
          <Button onClick={add}>
            {buttons.add || __('Add item', 'wpify-custom-fields')}
          </Button>
        </div>
      )}
    </div>
  );
}

MultiGroup.checkValidity = checkValidityMultiGroupType;

export default MultiGroup;
