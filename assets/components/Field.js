import { applyFilters } from '@wordpress/hooks';
import { ErrorBoundary } from 'react-error-boundary';
import { __, sprintf } from '@wordpress/i18n';
import { Text } from '@/fields/Text.js';
import { Label } from '@/components/Label';
import clsx from 'clsx';
import { useConditions, useTabs } from '@/helpers/hooks';
import { useEffect, useMemo } from 'react';
import { FieldWrapper } from '@/components/FieldWrapper';
import { ControlWrapper } from '@/components/ControlWrapper';
import { FieldDescription } from '@/components/FieldDescription';
import { maybePortal } from '@/helpers/functions';

export function Field ({
  type,
  name,
  node,
  renderOptions,
  description,
  value,
  tab,
  setValidity,
  conditions,
  fieldPath,
  isRoot = false,
  ...props
}) {
  const FieldComponent = useMemo(() => applyFilters('wpifycf_field_' + type, Text, props), [type, props]);
  const { isCurrentTab } = useTabs({ tab });
  const shown = useConditions({ conditions, fieldPath });
  const isHidden = !shown || !isCurrentTab;

  const validity = useMemo(
    () => {
      if (!isHidden && typeof FieldComponent.checkValidity === 'function') {
        return FieldComponent.checkValidity(value, { ...props, type });
      }

      return [];
    },
    [FieldComponent, value, props, type],
  );

  useEffect(() => {
    if (typeof setValidity === 'function') {
      setValidity(validity);
    }
  }, [setValidity, validity]);

  const hiddenField = name && (
    <input type="hidden" name={name} data-hide-field={isHidden ? 'true' : 'false'} value={typeof value !== 'string' ? JSON.stringify(value) : value} />
  );

  const validityMessages = props.validity?.filter(v => typeof v === 'string') || [];

  return maybePortal(isHidden
    ? hiddenField
    : (
      <FieldWrapper renderOptions={renderOptions}>
        <Label
          renderOptions={renderOptions}
          type={type}
          className="wpifycf-field__label"
          node={node}
          isRoot={isRoot}
          {...props}
        />
        <ControlWrapper renderOptions={renderOptions}>
          {hiddenField}
          {FieldComponent.descriptionPosition === 'before' && (
            <FieldDescription
              renderOptions={renderOptions}
              description={description}
              descriptionPosition="before"
            />
          )}
          <ErrorBoundary
            fallback={(
              <span className="wpifycf-error-boundary">
                {sprintf(__('An error occurred while rendering the field of type %s.', 'wpify-custom-fields'), type)}
              </span>
            )}
          >
            <FieldComponent
              type={type}
              value={value}
              className={clsx('wpifycf-field', `wpifycf-field--${type}`, props.className, validityMessages.length > 0 && 'wpifycf-field--invalid')}
              fieldPath={fieldPath}
              {...props}
            />
          </ErrorBoundary>
          {validityMessages.map((message, index) => (
            <label htmlFor={props.htmlId} key={index} className="wpifycf-field__error">
              {message}
            </label>
          ))}
          {FieldComponent.descriptionPosition !== 'before' && (
            <FieldDescription
              renderOptions={renderOptions}
              description={description}
              descriptionPosition="after"
            />
          )}
        </ControlWrapper>
      </FieldWrapper>
    ), node);
}
