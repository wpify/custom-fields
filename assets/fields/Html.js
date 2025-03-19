import { ErrorBoundary } from 'react-error-boundary';
import clsx from 'clsx';
import { addFilter } from '@wordpress/hooks';
import { useEffect } from 'react';

function Html ({
  attributes = {},
  id,
  className,
  content,
}) {
  return (
    <ErrorBoundary fallback={<div>Failed to render HTML field</div>}>
      <div
        className={clsx('wpifycf-field-HTML', `wpifycf-field-html--${id}`, attributes.class, className)}
        {...attributes}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </ErrorBoundary>
  );
}

Html.renderOptions = {
  noLabel: true,
};

addFilter('wpifycf_field_html', 'wpify_custom_fields', () => Html);
