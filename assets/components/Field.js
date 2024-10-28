import { applyFilters } from '@wordpress/hooks';
import { ErrorBoundary } from 'react-error-boundary';
import { __, sprintf } from '@wordpress/i18n';
import { Text } from '@/fields/Text.js';
import { Label } from '@/components/Label';
import clsx from 'clsx';
import { useConditions } from '@/helpers/hooks';
import { useContext, useEffect, useMemo } from 'react';
import { FieldWrapper } from '@/components/FieldWrapper';
import { ControlWrapper } from '@/components/ControlWrapper';
import { FieldDescription } from '@/components/FieldDescription';
import { maybePortal } from '@/helpers/functions';
import { AppContext } from '@/custom-fields';

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
  const { currentTab } = useContext(AppContext);
  const shown = useConditions({ conditions, fieldPath });
  const isCurrentTab = !tab || !currentTab || currentTab === tab;
  const isHidden = !shown || !isCurrentTab;

  const validity = useMemo(
    () => !isHidden && typeof FieldComponent.checkValidity === 'function'
      ? FieldComponent.checkValidity(value, { ...props, type })
      : [],
    [FieldComponent, value, props, type, isHidden],
  );

  useEffect(() => {
    if (typeof setValidity === 'function') {
      setValidity(validity);
    }
  }, [setValidity, validity]);

  const hiddenField = name && (
    <input
      type="hidden"
      name={name}
      data-hide-field={isHidden ? 'true' : 'false'}
      value={typeof value === 'undefined' ? '' : typeof value !== 'string' ? JSON.stringify(value) : value}
    />
  );

  const validityMessages = props.validity?.filter(v => typeof v === 'string') || [];

  const combinedRenderOptions = FieldComponent.renderOptions
    ? { ...renderOptions, ...FieldComponent.renderOptions }
    : { ...renderOptions };

  return maybePortal(isHidden
    ? hiddenField
    : (
      <FieldWrapper renderOptions={combinedRenderOptions}>
        <Label
          renderOptions={combinedRenderOptions}
          type={type}
          className="wpifycf-field__label"
          node={node}
          isRoot={isRoot}
          {...props}
        />
        <ControlWrapper renderOptions={combinedRenderOptions}>
          {hiddenField}
          {FieldComponent.descriptionPosition === 'before' && (
            <FieldDescription
              renderOptions={combinedRenderOptions}
              description={description}
              descriptionPosition="before"
            />
          )}
          <ErrorBoundary
            fallback={(
              <div className="wpifycf-error-boundary">
                {sprintf(__('An error occurred while rendering the field of type %s.', 'wpify-custom-fields'), type)}
              </div>
            )}
          >
            <FieldComponent
              type={type}
              value={value}
              className={clsx(
                'wpifycf-field',
                `wpifycf-field--${type}`,
                props.className,
                validityMessages.length > 0 && 'wpifycf-field--invalid',
                combinedRenderOptions.noLabel && 'wpifycf-field--no-label',
                combinedRenderOptions.isRoot && 'wpifycf-field--is-root',
              )}
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
              renderOptions={combinedRenderOptions}
              description={description}
              descriptionPosition="after"
            />
          )}
        </ControlWrapper>
      </FieldWrapper>
    ), node);
}
