import { createPortal } from 'react-dom';
import { applyFilters } from '@wordpress/hooks';
import { ErrorBoundary } from 'react-error-boundary';
import { __, sprintf } from '@wordpress/i18n';
import { Text } from '@/fields/Text.js';
import { Label } from '@/components/Label';
import clsx from 'clsx';
import { useCustomFieldsContext, useTab } from '@/helpers/hooks';

export function Field ({ type, name, node, renderOptions, description, value, tab, ...props }) {
  const context = useCustomFieldsContext(state => state.context);
  const FieldComponent = applyFilters('wpifycf_field_' + type, Text, props);
  const LabelComponent = applyFilters('wpifycf_label_' + context, Label, props);
  const currentTab = useTab(state => state.tab);

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

  const isHidden = tab && currentTab && currentTab !== tab && !!name;
  const hiddenField = name && <input type="hidden" name={name} data-hide-field={isHidden ? 'true' : 'false'} value={typeof value === 'object' ? JSON.stringify(value) : value} />;

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
      <ErrorBoundary fallback={fallback}>
        {hiddenField}
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
    return children;
  }

  return (
    <span className="wpifycf-field__wrapper">
      {children}
    </span>
  );
}
