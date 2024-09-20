import { ErrorBoundary } from 'react-error-boundary';
import clsx from 'clsx';
import { addFilter } from '@wordpress/hooks';

function Html ({
  attributes = {},
  id,
  className,
  content,
}) {
  return (
    <ErrorBoundary fallback={<span>Failed to render HTML field</span>}>
      <span
        className={clsx('wpifycf-field-HTML', `wpifycf-field-html--${id}`, attributes.class, className)}
        {...attributes}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </ErrorBoundary>
  );
}

addFilter('wpifycf_field_html', 'wpify_custom_fields', () => Html);
