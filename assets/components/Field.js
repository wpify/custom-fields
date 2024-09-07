import { createPortal } from 'react-dom';
import { applyFilters } from '@wordpress/hooks';
import { ErrorBoundary } from 'react-error-boundary';
import { __, sprintf } from '@wordpress/i18n';
import { Text } from '@/fields/Text.js';
import { FieldWrapper } from '@/components/FieldWrapper';
import { Label } from '@/components/Label';

export function Field ({ type, node, renderOptions, description, ...props }) {
  const FieldComponent = applyFilters('wpifycf_field_' + type, Text, props);

  const fallback = (
    <div className="wpifycf-error-boundary">
      {sprintf(__('An error occurred while rendering the field of type %s.', 'wpify-custom-fields'), type)}
    </div>
  );

  const descriptionPosition = FieldComponent.descriptionPosition || 'after';

  const renderedDescription = description && (
    <div className="wpifycf-field-description">
      {description}
    </div>
  );

  const field = (
    <FieldWrapper renderOptions={renderOptions}>
      {descriptionPosition === 'before' && renderedDescription}
      <Label
        type={type}
        renderOptions={renderOptions}
        {...props}
      />
      <ErrorBoundary fallback={fallback}>
        <FieldComponent
          type={type}
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
