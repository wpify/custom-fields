import { Group } from '@/fields/Group';
import { addFilter } from '@wordpress/hooks';
import { useMulti } from '@/helpers/hooks';
import clsx from 'clsx';
import { Button } from '@/components/Button';
import { __ } from '@wordpress/i18n';
import { IconButton } from '@/components/IconButton';
import { checkValidityMultiGroupType } from '@/helpers/validators';

function MultiGroup ({
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
  if (!Array.isArray(value)) {
    value = [];
  }

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
    dragHandle: '.wpifycf__move-handle',
  });

  const fieldsValidity = validity?.reduce((acc, item) => {
    if (typeof item === 'object') {
      return { ...acc, ...item };
    }

    return acc;
  }, {});

  return (
    <span className={clsx('wpifycf-field-multi-group', `wpifycf-field-multi-group--${props.id}`, props.attributes?.class, className)}>
      <span className="wpifycf-field-multi-group__items" ref={containerRef}>
        {Array.isArray(value) && value.map((value, index) => (
          <span
            className={clsx(
              'wpifycf-field-multi-group__item',
              collapsed[index] && 'wpifycf-field-multi-group__item--collapsed',
              fieldsValidity[index] && 'wpifycf-field-multi-group__item--invalid',
            )}
            key={keyPrefix + '.' + index}
          >
            <span className="wpifycf-field-multi-group__item-header wpifycf__move-handle">
              {canMove && (
                <span className="wpifycf-field-multi-group__sort" onClick={toggleCollapsed(index)}>
                  <IconButton icon="move" className="wpifycf-sort" />
                </span>
              )}
              <span className="wpifycf-field-multi-group__title" onClick={toggleCollapsed(index)}>
                <Group.Title field={props} value={value} index={index} />
              </span>
              <span className={clsx('wpifycf-field-multi-group__header-actions')}>
                {canDuplicate && (
                  <span className="wpifycf-field-multi-group__duplicate">
                    {buttons.duplicate ? (
                      <Button onClick={duplicate(index)}>
                        {buttons.duplicate}
                      </Button>
                    ) : (
                      <IconButton icon="duplicate" onClick={duplicate(index)} />
                    )}
                  </span>
                )}
                {canRemove && (
                  <span className="wpifycf-field-multi-group__remove">
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
            </span>
            <span className="wpifycf-field-multi-group__content">
              <Group
                value={value}
                default={defaultValue}
                onChange={handleChange(index)}
                {...props}
                htmlId={htmlId + '.' + index}
                validity={fieldsValidity[index]}
              />
            </span>
          </span>
        ))}
      </span>
      {canAdd && (
        <span className="wpifycf-field-multi-group__actions">
          <Button onClick={add}>
            {buttons.add || __('Add item', 'wpify-custom-fields')}
          </Button>
        </span>
      )}
    </span>
  );
}

MultiGroup.checkValidity = checkValidityMultiGroupType;

addFilter('wpifycf_field_multi_group', 'wpify_custom_fields', () => MultiGroup);
