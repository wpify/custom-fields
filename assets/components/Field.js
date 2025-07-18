import { applyFilters } from '@wordpress/hooks';
import { ErrorBoundary } from 'react-error-boundary';
import { __, sprintf } from '@wordpress/i18n';
import { Label } from '@/components/Label';
import clsx from 'clsx';
import { useConditions } from '@/helpers/hooks';
import { useContext, useEffect, useMemo } from 'react';
import { FieldWrapper } from '@/components/FieldWrapper';
import { ControlWrapper } from '@/components/ControlWrapper';
import { FieldDescription } from '@/components/FieldDescription';
import { getFieldComponentByType, maybePortal } from '@/helpers/functions';
import { AppContext } from '@/components/AppContext';

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
  generator,
  ...props
}) {
  const FieldComponent = useMemo(() => getFieldComponentByType(type, props), [type, props]);
  const { currentTab, values: allValues } = useContext(AppContext);
  const shown = useConditions({ conditions, fieldPath });
  const isCurrentTab = !tab || !currentTab || currentTab === tab;
  const isHidden = !shown || !isCurrentTab || type === 'hidden';

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

  useEffect(() => {
    if (!value && typeof generator === 'string') {
      const nextValue = applyFilters('wpifycf_generator_' + generator, value, props);

      if (nextValue && nextValue !== value) {
        props.onChange(nextValue);
      }
    } else if (!value && props.default) {
      props.onChange(props.default);
    }
  }, [value, generator, props.onChange, props.default]);

  const hiddenField = name && (
    <input
      type="hidden"
      name={name}
      data-hide-field={isHidden ? 'true' : 'false'}
      value={typeof value === 'undefined' ? '' : typeof value !== 'string' ? JSON.stringify(value) : value}
    />
  );

  const validityMessages = props.validity?.filter(v => typeof v === 'string') || [];

  const combinedRenderOptions = {
    ...(FieldComponent.renderOptions || {}),
    ...renderOptions,
    ...(props.render_options || {}),
  };

  if (combinedRenderOptions.noLabel && combinedRenderOptions.isRoot) {
    const closestTd = node?.closest('td');
    const closestTr = closestTd?.closest('tr');
    const closestTh = closestTr?.querySelector(':scope > th');

    if (closestTd) {
      closestTd.setAttribute('colspan', 2);
    }

    if (closestTh) {
      closestTh.remove();
    }
  }

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
              allValues={allValues}
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
