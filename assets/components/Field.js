import { Fragment } from 'react';
import { createPortal } from 'react-dom';
import { applyFilters } from '@wordpress/hooks';
import { ErrorBoundary } from 'react-error-boundary';
import { __, sprintf } from '@wordpress/i18n';
import { Text } from '@/fields/Text.js';
import { Label } from '@/components/Label';
import clsx from 'clsx';

export function Field ({ type, name, node, renderOptions, description, value, ...props }) {
  const FieldComponent = applyFilters('wpifycf_field_' + type, Text, props);

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
        `wpifycf-field__description--${descriptionPosition}`
      )}
    >
      {description}
    </span>
  );

  const field = (
    <FieldWrapper renderOptions={renderOptions}>
      {descriptionPosition === 'before' && renderedDescription}
      <Label
        type={type}
        renderOptions={renderOptions}
        className="wpifycf-field__label"
        {...props}
      />
      <ErrorBoundary fallback={fallback}>
        {name && (
          <input type="hidden" name={name} value={typeof value === 'object' ? JSON.stringify(value) : value} />
        )}
        <FieldComponent
          type={type}
          value={value}
          {...props}
        />
      </ErrorBoundary>
      {descriptionPosition === 'after' && renderedDescription}
    </FieldWrapper>
  );

  if (node) {
    return createPortal(field, node);
  }

  return field;
}

export function FieldWrapper ({ renderOptions = {}, children }) {
  if (renderOptions.noWrapper === true) {
    return (
      <Fragment>
        {children}
      </Fragment>
    );
  }

  return (
    <span className="wpifycf-field__wrapper">
      {children}
    </span>
  );
}
