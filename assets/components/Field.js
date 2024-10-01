import { createPortal } from 'react-dom';
import { applyFilters } from '@wordpress/hooks';
import { ErrorBoundary } from 'react-error-boundary';
import { __, sprintf } from '@wordpress/i18n';
import { Text } from '@/fields/Text.js';
import { Label, OptionsLabel } from '@/components/Label';
import clsx from 'clsx';
import { useConditions, useTabs } from '@/helpers/hooks';
import { useContext, useEffect, useMemo } from 'react';
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
  ...props
}) {
  const { context } = useContext(AppContext);
  const FieldComponent = useMemo(() => applyFilters('wpifycf_field_' + type, Text, props), [type, props]);
  const LabelComponent = useMemo(
    () => {
      if (context === 'options') return OptionsLabel;
      return Label;
    },
    [context],
  );

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

  const fallback = (
    <span className="wpifycf-error-boundary">
      {sprintf(__('An error occurred while rendering the field of type %s.', 'wpify-custom-fields'), type)}
    </span>
  );

  const descriptionPosition = FieldComponent.descriptionPosition || 'after';

  const renderedDescription = description && (
    <span
      className={clsx(
        'wpifycf-field__description',
        `wpifycf-field__description--${descriptionPosition}`,
      )}
    >
      {description}
    </span>
  );

  const hiddenField = name && (
    <input type="hidden" name={name} data-hide-field={isHidden ? 'true' : 'false'} value={typeof value !== 'string' ? JSON.stringify(value) : value} />
  );

  const validityMessages = props.validity?.filter(v => typeof v === 'string') || [];

  const field = isHidden
    ? hiddenField
    : (
      <FieldWrapper renderOptions={renderOptions}>
        {descriptionPosition === 'before' && renderedDescription}
        <LabelComponent
          type={type}
          renderOptions={renderOptions}
          className="wpifycf-field__label"
          node={node}
          {...props}
        />
        {hiddenField}
        <ErrorBoundary fallback={fallback}>
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
        {descriptionPosition === 'after' && renderedDescription}
      </FieldWrapper>
    );

  return node ? createPortal(field, node) : field;
}

export function FieldWrapper ({ renderOptions = {}, children }) {
  return renderOptions.noWrapper === true
    ? children
    : (
      <span className="wpifycf-field__wrapper">
      {children}
    </span>
    );
}
